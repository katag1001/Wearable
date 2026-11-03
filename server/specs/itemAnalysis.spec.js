const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildAnalysisPrompt,
  buildResponseSchema,
  occasionKey,
  OCCASION_KEYS,
} = require("../services/analysisPrompt.js");
const { parseAnalysis, cleanName } = require("../services/analysisValidation.js");
const { pickUniqueName } = require("../services/itemNameService.js");
const { analyseImage, FALLBACK_OCCASION } = require("../services/itemAnalysisService.js");
const { OCCASION_TAGS } = require("../constants/occasionTags.js");
const { PROMPT_VERSION } = require("../constants/itemAnalysis.js");

const IMAGE = { mimeType: "image/jpeg", data: "abc" };

// Every occasion false, except the tags given.
const occasions = (...tags) =>
  Object.fromEntries(OCCASION_TAGS.map((tag) => [occasionKey(tag), tags.includes(tag)]));

const answer = (overrides = {}) => ({
  itemCount: "one",
  kind: "clothing",
  subtype: "Linen pants",
  pattern: "Plain",
  colors: ["Cream"],
  pieceDescription: "relaxed drawstring trousers, ankle length, linen",
  fabric: "Linen",
  colourDescription: "natural cream linen",
  occasions: occasions("Comfy casual", "Beach / pool"),
  name: "Cream linen trousers",
  specificName: "Cream drawstring linen trousers",
  ...overrides,
});

// A fake Gemini: hands out `replies` in order (an Error is thrown).
function fakeAsk(replies) {
  const calls = [];

  const ask = async (request) => {
    calls.push(request);
    const reply = replies[calls.length - 1];

    if (reply instanceof Error) throw reply;

    return { answer: reply, usage: { promptTokenCount: 100, candidatesTokenCount: 10 }, model: "test-model" };
  };

  return { ask, calls };
}

/* -------------------- Prompt and schema -------------------- */

test("occasion keys are unique and schema-safe", () => {
  assert.equal(new Set(OCCASION_KEYS).size, OCCASION_TAGS.length);
  assert.equal(occasionKey("Brunch / lunch"), "brunch_lunch");
  OCCASION_KEYS.forEach((key) => assert.match(key, /^[a-z_]+$/));
});

test("the schema's subtypes are the gender's clothing and footwear types", () => {
  const woman = buildResponseSchema("woman").properties.subtype.enum;
  const man = buildResponseSchema("man").properties.subtype.enum;

  assert.ok(woman.includes("Strappy summer dress"));
  assert.ok(woman.includes("Heeled boots"));
  assert.ok(!man.includes("Strappy summer dress"));
  assert.ok(man.includes("Formal shoes"));
  // An unknown gender gets the unisex lists.
  assert.deepEqual(buildResponseSchema(null).properties.subtype.enum, buildResponseSchema("unisex").properties.subtype.enum);
});

test("the schema asks for every occasion", () => {
  const { occasions: schema } = buildResponseSchema("woman").properties;

  assert.deepEqual(schema.required, OCCASION_KEYS);
});

test("the prompt lists every occasion with its definition and the types with hints", () => {
  const prompt = buildAnalysisPrompt("woman");

  OCCASION_TAGS.forEach((tag) => assert.ok(prompt.includes(`"${tag}"`), tag));
  assert.ok(prompt.includes("- Knit vest/tank: A sleeveless top made of knitted fabric"));
  assert.ok(prompt.includes("- Linen: Linen or linen blends"));
  assert.ok(!/seasons -/.test(prompt), "seasons are no longer asked");
  assert.ok(prompt.includes("Ankle boots"));
});

/* -------------------- Checking the answer -------------------- */

test("a good clothing answer becomes the item's fields", () => {
  const parsed = parseAnalysis(answer(), "woman");

  assert.equal(parsed.status, "ok");
  assert.equal(parsed.kind, "clothing");
  assert.deepEqual(parsed.fields, {
    type: "bottom",
    subtype: "Linen pants",
    pattern: "Plain",
    colors: ["Cream"],
    tags: ["Comfy casual", "Beach / pool"],
    fabric: "Linen",
  });
  assert.deepEqual(parsed.names, ["Cream linen trousers", "Cream drawstring linen trousers"]);
  assert.equal(parsed.needsOccasion, false);
});

test("footwear gets a style from its colours and no type or pattern", () => {
  const parsed = parseAnalysis(
    answer({ kind: "footwear", subtype: "Ankle boots", colors: ["Black", "Tan"], pattern: "Floral" }),
    "woman"
  );

  assert.equal(parsed.kind, "footwear");
  assert.equal(parsed.fields.styles, "Patterned");
  assert.equal(parsed.fields.type, undefined);
  assert.equal(parsed.fields.pattern, undefined);
});

test("the subtype decides clothing or footwear, not the answer's kind", () => {
  assert.equal(parseAnalysis(answer({ kind: "footwear" }), "woman").kind, "clothing");
});

test("more than one item, or none, is reported as such", () => {
  assert.deepEqual(parseAnalysis(answer({ itemCount: "multiple" }), "woman"), { status: "multiple" });
  assert.deepEqual(parseAnalysis(answer({ itemCount: "none" }), "woman"), { status: "none" });
});

test("values off the app's lists are dropped, and an unusable answer is invalid", () => {
  const parsed = parseAnalysis(answer({ colors: ["Cream", "Mauve", "Cream"], pattern: "Tartan" }), "woman");

  assert.deepEqual(parsed.fields.colors, ["Cream"]);
  assert.equal(parsed.fields.pattern, "Plain");

  assert.equal(parseAnalysis(answer({ subtype: "Kilt" }), "woman").status, "invalid");
  assert.equal(parseAnalysis(answer({ subtype: "Strappy summer dress" }), "man").status, "invalid");
  assert.equal(parseAnalysis(answer({ colors: ["Mauve"] }), "woman").status, "invalid");
  // Fabric: "Not sure" or anything off the list is saved as unknown ("").
  assert.equal(parseAnalysis(answer({ fabric: "Not sure" }), "woman").fields.fabric, "");
  assert.equal(parseAnalysis(answer({ fabric: "Hessian" }), "woman").fields.fabric, "");
  assert.equal(parseAnalysis(null, "woman").status, "invalid");
});

test("no occasion at all asks for the closest", () => {
  assert.equal(parseAnalysis(answer({ occasions: occasions() }), "woman").needsOccasion, true);
});

test("names are tidied and kept short", () => {
  assert.equal(cleanName("  cream   linen trousers "), "Cream linen trousers");
  assert.ok(cleanName("a ".repeat(60)).length <= 50);
});

/* -------------------- Names -------------------- */

test("the short name is used when free, then the specific one, then a number", () => {
  const names = ["Cream linen trousers", "Cream drawstring linen trousers"];

  assert.equal(pickUniqueName(names, []), "Cream linen trousers");
  assert.equal(pickUniqueName(names, ["cream LINEN trousers"]), "Cream drawstring linen trousers");
  assert.equal(
    pickUniqueName(names, ["Cream linen trousers", "Cream drawstring linen trousers", "Cream drawstring linen trousers 2"]),
    "Cream drawstring linen trousers 3"
  );
});

/* -------------------- The whole analysis -------------------- */

test("a good answer comes back named, with how it was analysed", async () => {
  const { ask, calls } = fakeAsk([answer()]);

  const result = await analyseImage({ image: IMAGE, gender: "woman", takenNames: ["Cream linen trousers"], ask });

  assert.equal(result.status, "ok");
  assert.equal(calls.length, 1);
  assert.equal(result.fields.name, "Cream drawstring linen trousers");
  assert.equal(result.fields.analysis.promptVersion, PROMPT_VERSION);
  assert.equal(result.fields.analysis.model, "test-model");
  assert.deepEqual(result.fields.analysis.answer, answer());
  assert.equal(result.usage.requests, 1);
});

test("an unusable answer is asked again once, then fails", async () => {
  const retried = fakeAsk([answer({ subtype: "Kilt" }), answer()]);
  assert.equal((await analyseImage({ image: IMAGE, gender: "woman", ask: retried.ask })).status, "ok");
  assert.equal(retried.calls.length, 2);

  const failed = fakeAsk([answer({ subtype: "Kilt" }), { nonsense: true }, answer()]);
  const result = await analyseImage({ image: IMAGE, gender: "woman", ask: failed.ask });
  assert.equal(result.status, "failed");
  assert.equal(failed.calls.length, 2);
});

test("a busy Gemini is tried again; other errors aren't", async () => {
  const busy = Object.assign(new Error("overloaded"), { status: 503 });
  const retried = fakeAsk([busy, answer()]);
  assert.equal((await analyseImage({ image: IMAGE, gender: "woman", ask: retried.ask })).status, "ok");

  const denied = Object.assign(new Error("bad key"), { status: 403 });
  await assert.rejects(analyseImage({ image: IMAGE, gender: "woman", ask: fakeAsk([denied, answer()]).ask }));
});

test("multiple items are reported without naming anything", async () => {
  const result = await analyseImage({ image: IMAGE, gender: "woman", ask: fakeAsk([answer({ itemCount: "multiple" })]).ask });

  assert.equal(result.status, "multiple");
  assert.equal(result.fields, undefined);
});

test("no occasion: the closest one is asked for and used", async () => {
  const { ask, calls } = fakeAsk([answer({ occasions: occasions() }), { occasion: "Lounge / home" }]);

  const result = await analyseImage({ image: IMAGE, gender: "woman", ask });

  assert.deepEqual(result.fields.tags, ["Lounge / home"]);
  assert.equal(calls.length, 2);
  assert.equal(result.fields.analysis.answer.closestOccasion, "Lounge / home");
});

test("no occasion and no usable follow-up: the everyday fallback", async () => {
  const result = await analyseImage({
    image: IMAGE,
    gender: "woman",
    ask: fakeAsk([answer({ occasions: occasions() }), { occasion: "Picnic" }]).ask,
  });

  assert.deepEqual(result.fields.tags, [FALLBACK_OCCASION]);
});
