// server/scripts/evaluateItemAnalysis.js
//
// Tests the photo analysis on items a user has already saved: every photo
// is analysed as if it were new, and the answer is compared with what the
// item has saved (type, subtype, pattern, fabric, colours, tags). Changes
// NOTHING in the database and doesn't count towards the daily limit - but
// each item is a real (paid) Gemini request.
//
//   node server/scripts/evaluateItemAnalysis.js you@example.com
//   node server/scripts/evaluateItemAnalysis.js you@example.com --limit 10
//   node server/scripts/evaluateItemAnalysis.js you@example.com --model gemini-3.8-flash
//   node server/scripts/evaluateItemAnalysis.js you@example.com --kind footwear
//   node server/scripts/evaluateItemAnalysis.js you@example.com --answers backup.json
//
// --answers takes a JSON file of the user's own earlier values
// ({ clothes: [...], footwear: [...] }, matched by item id); its colours are
// the answer key for the colour scores.
//
// Writes a report to server/scripts/reports/ (git-ignored): open the .html
// in a browser to see every item's photo with the saved and analysed
// values side by side. Reads MONGO, Cloudinary and GEMINI_* from
// server/.env, like the server does.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { User, Clothes, Footwear } = require("../models/AllModels.js");
const { getUserMatchingPreferences } = require("../services/matchScoreService.js");
const { loadAnalysisImage, analysisImageUrl } = require("../services/analysisImageService.js");
const { analyseImage } = require("../services/itemAnalysisService.js");
const { isGeminiConfigured, getModel } = require("../services/geminiClient.js");
const { subtypeIndex } = require("../services/analysisPrompt.js");
const { PLAIN } = require("../constants/patternRules.js");

const REPORTS_DIR = path.join(__dirname, "reports");
const CONCURRENCY = 4;

// $ per million tokens (input, output) - for the cost estimate only.
const PRICES = {
  "gemini-3.5-flash-lite": [0.3, 2.5],
  "gemini-3.8-flash": [0.75, 3.75],
};

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

/* -------------------- Loading -------------------- */

async function loadItems(userId, kind) {
  const withImage = { userId, cloudinaryId: { $nin: [null, ""] } };

  const [clothes, footwear] = await Promise.all([
    kind === "footwear" ? [] : Clothes.find(withImage).lean(),
    kind === "clothing" ? [] : Footwear.find(withImage).lean(),
  ]);

  return [
    ...clothes.map((item) => ({ ...item, kind: "clothing" })),
    ...footwear.map((item) => ({ ...item, kind: "footwear" })),
  ];
}

// Runs `work` over `items`, CONCURRENCY at a time, in order.
async function mapLimited(items, work) {
  const results = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await work(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  return results;
}

/* -------------------- Comparing -------------------- */

const sameSet = (a, b) => a.length === b.length && a.every((value) => b.includes(value));

// One item's saved values vs the analysis. `null` = not comparable.
function compareItem(saved, result, currentSubtypes, yours) {
  if (result.status !== "ok") {
    return { status: result.status };
  }

  const ai = result.fields;
  const savedTags = saved.tags || [];
  const shared = ai.tags.filter((tag) => savedTags.includes(tag));

  return {
    status: "ok",
    kind: result.kind === saved.kind,
    type: saved.kind === "clothing" && result.kind === "clothing" ? ai.type === saved.type : null,
    // Items still on a type that no longer exists can't be compared.
    subtype: currentSubtypes.has(saved.subtype) ? ai.subtype === saved.subtype : null,
    pattern:
      saved.kind === "clothing" && result.kind === "clothing"
        ? ai.pattern === (saved.pattern || PLAIN)
        : null,
    mainColour: (saved.colors || []).includes(ai.colors[0]),
    allColours: sameSet(ai.colors, saved.colors || []),
    fabric: saved.kind === "clothing" && saved.fabric ? ai.fabric === saved.fabric : null,
    // Items with no saved tags can't be compared either way.
    tagPrecision: ai.tags.length && savedTags.length ? shared.length / ai.tags.length : null,
    tagRecall: savedTags.length ? shared.length / savedTags.length : null,
    // Against the user's own colours (--answers).
    yourExact: yours ? sameSet(ai.colors, yours) : null,
    yourMain: yours ? yours.includes(ai.colors[0]) : null,
    yourExtras: yours ? ai.colors.filter((colour) => !yours.includes(colour)).length : null,
  };
}

const percent = (part, whole) => (whole ? `${Math.round((part / whole) * 100)}%` : "-");

function rate(rows, field) {
  const known = rows.filter((row) => row[field] !== null && row[field] !== undefined);
  return { right: known.filter((row) => row[field] === true).length, of: known.length };
}

function average(rows, field) {
  const known = rows.map((row) => row[field]).filter((value) => typeof value === "number");
  return known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : null;
}

function summarise(comparisons, usage, model) {
  const ok = comparisons.filter((row) => row.status === "ok");
  const [inputPrice, outputPrice] = PRICES[model] || [null, null];

  const cost =
    inputPrice === null
      ? null
      : (usage.promptTokens * inputPrice + usage.outputTokens * outputPrice) / 1e6;

  const line = (label, { right, of }, note = "") =>
    ({ label, value: `${percent(right, of)} (${right}/${of})`, note });

  return [
    { label: "Items analysed", value: String(comparisons.length) },
    {
      label: "Not read as one item",
      value: String(comparisons.length - ok.length),
      note: "multiple / none / failed - every saved item is one item, so these are misses",
    },
    line("Clothing vs footwear", rate(ok, "kind")),
    line("Role (top, bottom...)", rate(ok, "type"), "clothing only"),
    line("Subtype", rate(ok, "subtype"), "items still on a type that no longer exists are left out"),
    line("Pattern", rate(ok, "pattern"), "clothing only; no saved pattern counts as Plain"),
    line("Main colour among saved colours", rate(ok, "mainColour")),
    line("Exactly the saved colours", rate(ok, "allColours")),
    line("Colours exactly yours", rate(ok, "yourExact"), "against --answers (your own earlier picks)"),
    line("Main colour among yours", rate(ok, "yourMain")),
    {
      label: "Colours added that you didn't pick",
      value: String(ok.reduce((sum, row) => sum + (row.yourExtras || 0), 0)),
    },
    line("Fabric", rate(ok, "fabric"), "clothing with a saved fabric only"),
    {
      label: "Tags: analysed that are saved",
      value: average(ok, "tagPrecision") === null ? "-" : `${Math.round(average(ok, "tagPrecision") * 100)}%`,
      note: "saved tags mostly came from type defaults, so treat as a rough guide",
    },
    {
      label: "Tags: saved that were analysed",
      value: average(ok, "tagRecall") === null ? "-" : `${Math.round(average(ok, "tagRecall") * 100)}%`,
    },
    {
      label: "Tokens (in / out)",
      value: `${usage.promptTokens} (${usage.cachedTokens} reused) / ${usage.outputTokens} over ${usage.requests} requests`,
    },
    { label: "Estimated cost", value: cost === null ? "unknown model price" : `$${cost.toFixed(4)}` },
  ];
}

/* -------------------- Report -------------------- */

const escape = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);


function valueRow(label, saved, analysed, same) {
  return `<tr class="${same === null ? "" : same ? "same" : "diff"}"><th>${label}</th><td>${escape(saved)}</td><td>${escape(analysed)}</td></tr>`;
}

function tagsRow(saved, analysed) {
  const savedTags = saved || [];
  const chips = [
    ...analysed.filter((tag) => savedTags.includes(tag)).map((tag) => `<span class="tag">${escape(tag)}</span>`),
    ...analysed.filter((tag) => !savedTags.includes(tag)).map((tag) => `<span class="tag added">+ ${escape(tag)}</span>`),
    ...savedTags.filter((tag) => !analysed.includes(tag)).map((tag) => `<span class="tag removed">− ${escape(tag)}</span>`),
  ];

  return `<tr><th>Tags</th><td colspan="2">${chips.join(" ")}</td></tr>`;
}

function itemCard(saved, result, comparison, yours) {
  const image = `<img src="${escape(analysisImageUrl(saved.cloudinaryId))}" alt="">`;

  if (result.status !== "ok") {
    return `<div class="card"><div>${image}</div><div><h3>${escape(saved.name)}</h3><p class="diff">Analysis: ${escape(result.status)}${result.problems ? ` (${escape(result.problems.join("; "))})` : ""}</p></div></div>`;
  }

  const ai = result.fields;

  return `<div class="card"><div>${image}</div><div>
<h3>${escape(saved.name)} <span class="muted">→ ${escape(ai.name)}</span></h3>
<table><tr><th></th><th>Saved</th><th>Analysed</th></tr>
${valueRow("Kind", saved.kind, result.kind, comparison.kind)}
${valueRow("Subtype", saved.subtype, ai.subtype, comparison.subtype)}
${result.kind === "clothing" ? valueRow("Pattern", saved.pattern || PLAIN, ai.pattern, comparison.pattern) : ""}
${valueRow("Colours", (saved.colors || []).join(", "), ai.colors.join(", "), comparison.allColours)}
${yours ? valueRow("Your colours", yours.join(", "), ai.colors.join(", "), comparison.yourExact) : ""}
${valueRow("Gemini's words", "", ai.analysis.answer.colourDescription || "", null)}
${result.kind === "clothing" ? valueRow("Fabric", saved.fabric || "-", ai.fabric || "not sure", comparison.fabric) : ""}
${tagsRow(saved.tags, ai.tags)}
</table></div></div>`;
}

function buildReport({ email, model, summary, cards }) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Photo analysis check</title>
<style>
body{font-family:system-ui,sans-serif;margin:24px;color:#222;background:#fafafa}
.summary td,.summary th{padding:4px 12px;text-align:left;vertical-align:top}
.note{color:#777;font-size:13px}
.card{display:grid;grid-template-columns:220px 1fr;gap:16px;background:#fff;border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0}
.card img{width:220px;max-height:280px;object-fit:contain;background:#f0f0f0}
.card table{border-collapse:collapse;font-size:14px}
.card th,.card td{padding:3px 10px;text-align:left;vertical-align:top}
tr.diff td{background:#fde8e8}
tr.same td{background:#eaf6ea}
p.diff{color:#b00}
.muted{color:#777;font-weight:normal}
.tag{display:inline-block;padding:2px 8px;margin:2px;border-radius:10px;background:#eee;font-size:12px}
.tag.added{background:#d8f0d8}
.tag.removed{background:#f6d6d6;text-decoration:line-through}
</style></head><body>
<h1>Photo analysis check</h1>
<p>${escape(email)} · model ${escape(model)} · ${new Date().toLocaleString("en-GB")}</p>
<table class="summary">${summary.map((row) => `<tr><th>${escape(row.label)}</th><td>${escape(row.value)}</td><td class="note">${escape(row.note || "")}</td></tr>`).join("")}</table>
<p class="note">Green rows match what's saved, red rows don't. Tags: <span class="tag added">+ analysed only</span> <span class="tag removed">− saved only</span></p>
${cards.join("\n")}
</body></html>`;
}

/* -------------------- Run -------------------- */

async function main() {
  const email = process.argv[2];

  if (!email || email.startsWith("--")) {
    console.error("Usage: node server/scripts/evaluateItemAnalysis.js <email> [--limit N] [--model name] [--kind clothing|footwear]");
    process.exit(1);
  }

  if (!isGeminiConfigured()) {
    console.error("GEMINI_API_KEY isn't set in server/.env");
    process.exit(1);
  }

  const model = argValue("--model") || getModel();
  const limit = Number(argValue("--limit")) || null;
  const kind = argValue("--kind");
  const answersFile = argValue("--answers");
  // item id -> the user's own colours.
  const answerColours = new Map();

  if (answersFile) {
    const answers = JSON.parse(fs.readFileSync(answersFile, "utf8"));
    [...(answers.clothes || []), ...(answers.footwear || [])].forEach((item) => {
      answerColours.set(String(item._id), item.colors || []);
    });
  }

  await mongoose.connect(process.env.MONGO);

  const user = await User.findOne({ email }).lean();

  if (!user) {
    throw new Error(`No user with the email ${email}`);
  }

  const { gender } = await getUserMatchingPreferences(user._id);
  const currentSubtypes = subtypeIndex(gender);

  const allItems = await loadItems(user._id, kind);
  const items = limit ? allItems.slice(0, limit) : allItems;

  console.log(`Analysing ${items.length} items with ${model} (gender: ${gender})...`);

  let usage = { promptTokens: 0, cachedTokens: 0, outputTokens: 0, requests: 0 };

  const results = await mapLimited(items, async (item, index) => {
    let result;

    try {
      const image = await loadAnalysisImage(item.cloudinaryId);
      result = await analyseImage({ image, gender, model });
    } catch (error) {
      result = { status: "failed", problems: [error.message] };
    }

    if (result.usage) {
      usage = {
        promptTokens: usage.promptTokens + result.usage.promptTokens,
        cachedTokens: usage.cachedTokens + result.usage.cachedTokens,
        outputTokens: usage.outputTokens + result.usage.outputTokens,
        requests: usage.requests + result.usage.requests,
      };
    }

    console.log(`  ${index + 1}/${items.length} ${item.name}: ${result.status}${result.fields ? ` -> ${result.fields.subtype}` : ""}`);

    return result;
  });

  const yoursFor = (item) => answerColours.get(String(item._id)) || null;
  const comparisons = items.map((item, i) =>
    compareItem(item, results[i], currentSubtypes, yoursFor(item))
  );
  const summary = summarise(comparisons, usage, model);
  const cards = items.map((item, i) => itemCard(item, results[i], comparisons[i], yoursFor(item)));

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const file = path.join(REPORTS_DIR, `analysis-${model}-${stamp}`);

  fs.writeFileSync(`${file}.html`, buildReport({ email, model, summary, cards }));
  fs.writeFileSync(
    `${file}.json`,
    JSON.stringify(
      items.map((item, i) => ({
        id: item._id,
        name: item.name,
        kind: item.kind,
        yourColours: yoursFor(item),
        result: results[i],
        comparison: comparisons[i],
      })),
      null,
      2
    )
  );

  console.log("");
  summary.forEach((row) => console.log(`${row.label}: ${row.value}`));
  console.log(`\nReport: ${file}.html`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
