// server/services/analysisValidation.js
//
// Turns Gemini's answer for one photo (services/analysisPrompt.js's
// schema) into the fields of a new clothing item or pair of footwear.
// The schema should already keep every value to the app's lists, but
// nothing is trusted: a value that isn't on a list is dropped here. Pure.
//
// Returns one of:
//   { status: "multiple" } / { status: "none" } - not one item in the photo
//   { status: "invalid", problems: [...] }       - can't be used; ask again
//   { status: "ok", kind, fields, names, needsOccasion }
// `names` are the name candidates, shortest first (services/itemNameService.js
// picks one that isn't taken). `needsOccasion` is true when no occasion
// came back true - every item needs one, so the closest is asked for.

const { PATTERNS, PLAIN } = require("../constants/patternRules.js");
const { OCCASION_TAGS } = require("../constants/occasionTags.js");
const { MAX_COLOURS, MAX_NAME_LENGTH } = require("../constants/itemAnalysis.js");
const { COLOURS, FABRICS, OCCASION_KEYS, subtypeIndex } = require("./analysisPrompt.js");

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function cleanColours(colors) {
  const known = (Array.isArray(colors) ? colors : []).filter((c) => COLOURS.includes(c));

  return [...new Set(known)].slice(0, MAX_COLOURS);
}

const cleanPattern = (pattern) => (PATTERNS.includes(pattern) ? pattern : PLAIN);

// "" (not known) for "Not sure" or anything off the list.
const cleanFabric = (fabric) => (FABRICS.includes(fabric) ? fabric : "");

function cleanTags(occasions) {
  const source = isObject(occasions) ? occasions : {};

  return OCCASION_TAGS.filter((tag, i) => source[OCCASION_KEYS[i]] === true);
}

// Tidy spacing, sentence case, cut to length (at a word if possible).
function cleanName(name) {
  const text = String(name ?? "").replace(/\s+/g, " ").trim();

  if (!text) return "";

  const capped = text.charAt(0).toUpperCase() + text.slice(1);

  if (capped.length <= MAX_NAME_LENGTH) return capped;

  const cut = capped.slice(0, MAX_NAME_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");

  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

// Short name first, then the more specific one; a made-up name if both
// are missing.
function nameCandidates(answer, colors, subtype) {
  const names = [cleanName(answer.name), cleanName(answer.specificName)].filter(Boolean);

  if (!names.length) {
    names.push(cleanName(`${colors[0]} ${subtype.toLowerCase()}`));
  }

  return [...new Set(names)];
}

// Footwear has no pattern - its style is Patterned when it has more than
// one colour, as the item form sets it.
const footwearStyle = (colors) => (colors.length > 1 ? "Patterned" : "Plain");

function parseAnalysis(answer, gender) {
  if (!isObject(answer)) {
    return { status: "invalid", problems: ["the answer isn't an object"] };
  }

  if (answer.itemCount === "multiple" || answer.itemCount === "none") {
    return { status: answer.itemCount };
  }

  const problems = [];

  const found = subtypeIndex(gender).get(answer.subtype);
  const colors = cleanColours(answer.colors);

  if (!found) problems.push(`unknown subtype "${answer.subtype}"`);
  if (!colors.length) problems.push("no known colour");

  if (problems.length) {
    return { status: "invalid", problems };
  }

  const tags = cleanTags(answer.occasions);

  const fields = {
    subtype: answer.subtype,
    colors,
    tags,
    ...(found.kind === "clothing"
      ? { type: found.type, pattern: cleanPattern(answer.pattern), fabric: cleanFabric(answer.fabric) }
      : { styles: footwearStyle(colors) }),
  };

  return {
    status: "ok",
    kind: found.kind,
    fields,
    names: nameCandidates(answer, colors, answer.subtype),
    needsOccasion: tags.length === 0,
  };
}

module.exports = { parseAnalysis, cleanName };
