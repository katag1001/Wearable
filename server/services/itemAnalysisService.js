// server/services/itemAnalysisService.js
//
// Analyses one photo of a new item: asks Gemini (services/geminiClient.js)
// with the prompt and schema from services/analysisPrompt.js, checks the
// answer (services/analysisValidation.js), and names the item
// (services/itemNameService.js).
//
// - An answer that can't be used, or a Gemini error worth retrying, is
//   asked again RETRIES times before giving up.
// - If no occasion came back true, the closest one is asked for once
//   (every item needs at least one tag).
//
// No DB access: the caller passes the image, the user's gender and the
// names they already use. `ask` can be swapped for a fake in tests.
//
// Returns { status, usage } plus, when status is "ok", { kind, fields }:
//   "ok"       - fields are ready to save (name, subtype, colours, pattern
//                or styles, fabric, tags, analysis)
//   "multiple" - more than one item in the photo
//   "none"     - no clothing or footwear in the photo
//   "failed"   - no usable answer (also `problems`)

const { askGemini, isRetryableError } = require("./geminiClient.js");
const {
  buildAnalysisPrompt,
  buildResponseSchema,
  buildClosestOccasionPrompt,
  CLOSEST_OCCASION_SCHEMA,
} = require("./analysisPrompt.js");
const { parseAnalysis } = require("./analysisValidation.js");
const { pickUniqueName } = require("./itemNameService.js");
const { OCCASION_TAGS } = require("../constants/occasionTags.js");
const { PROMPT_VERSION, RETRIES } = require("../constants/itemAnalysis.js");

// If even the follow-up can't name an occasion - the broadest everyday one.
const FALLBACK_OCCASION = "Elevated everyday";

// cachedTokens: the part of promptTokens Gemini reused from earlier
// requests (implicit caching), billed at a lower rate.
const addUsage = (total, usage) => ({
  promptTokens: total.promptTokens + (usage?.promptTokenCount || 0),
  cachedTokens: total.cachedTokens + (usage?.cachedContentTokenCount || 0),
  outputTokens:
    total.outputTokens + (usage?.candidatesTokenCount || 0) + (usage?.thoughtsTokenCount || 0),
  requests: total.requests + 1,
});

const NO_USAGE = { promptTokens: 0, cachedTokens: 0, outputTokens: 0, requests: 0 };

// Asks until the answer passes parseAnalysis, RETRIES more times at most.
async function askForAnalysis({ image, gender, ask, model }) {
  const prompt = buildAnalysisPrompt(gender);
  const schema = buildResponseSchema(gender);

  let usage = NO_USAGE;
  let last = { parsed: { status: "invalid", problems: ["no answer"] }, answer: null };

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const reply = await ask({ prompt, image, schema, model });

      usage = addUsage(usage, reply.usage);
      last = { parsed: parseAnalysis(reply.answer, gender), answer: reply.answer, model: reply.model };

      if (last.parsed.status !== "invalid") break;
    } catch (error) {
      if (!isRetryableError(error) || attempt === RETRIES) throw error;
    }
  }

  return { ...last, usage };
}

// The single closest occasion, or FALLBACK_OCCASION.
async function askForClosestOccasion({ image, ask, model }) {
  try {
    const reply = await ask({
      prompt: buildClosestOccasionPrompt(),
      image,
      schema: CLOSEST_OCCASION_SCHEMA,
      model,
    });

    const occasion = reply.answer?.occasion;

    return { tag: OCCASION_TAGS.includes(occasion) ? occasion : FALLBACK_OCCASION, usage: reply.usage };
  } catch {
    return { tag: FALLBACK_OCCASION, usage: null };
  }
}

async function analyseImage({ image, gender, takenNames = [], ask = askGemini, model }) {
  const { parsed, answer, usage: firstUsage, model: usedModel } = await askForAnalysis({
    image,
    gender,
    ask,
    model,
  });

  let usage = firstUsage;

  if (parsed.status === "invalid") {
    return { status: "failed", problems: parsed.problems, usage };
  }

  if (parsed.status !== "ok") {
    return { status: parsed.status, usage };
  }

  const fields = { ...parsed.fields };
  let closestOccasion = null;

  if (parsed.needsOccasion) {
    const closest = await askForClosestOccasion({ image, ask, model });

    usage = addUsage(usage, closest.usage);
    closestOccasion = closest.tag;
    fields.tags = [closest.tag];
  }

  return {
    status: "ok",
    kind: parsed.kind,
    fields: {
      ...fields,
      name: pickUniqueName(parsed.names, takenNames),
      analysis: {
        model: usedModel || model || null,
        promptVersion: PROMPT_VERSION,
        analysedAt: new Date(),
        answer: closestOccasion ? { ...answer, closestOccasion } : answer,
      },
    },
    usage,
  };
}

module.exports = { analyseImage, FALLBACK_OCCASION };
