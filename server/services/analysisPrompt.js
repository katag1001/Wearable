// server/services/analysisPrompt.js
//
// Builds what's sent to Gemini for one photo: the prompt and the JSON
// schema its answer must follow. The schema's enums hold the answer to the
// app's own lists - the gender's subtypes, shared/colors.json,
// shared/patterns.json, shared/fabrics.json and the occasion tags - so
// Gemini can't invent a value. Pure: no DB or network access. The rules
// are in constants/analysisPrompt.js, the definitions in
// constants/analysisDefinitions.js.
//
// The prompt is the same for every photo of a gender, and goes before the
// photo (services/geminiClient.js), so Gemini can reuse it across requests.

const subtypesByGender = require("../../shared/subtypesByGender.json");
const footwearByGender = require("../../shared/footwearByGender.json");
const COLOUR_LIST = require("../../shared/colors.json");
const FABRIC_LIST = require("../../shared/fabrics.json");
const { PATTERNS } = require("../constants/patternRules.js");
const { OCCASION_TAGS } = require("../constants/occasionTags.js");
const { MAX_COLOURS } = require("../constants/itemAnalysis.js");
const {
  PATTERN_DEFINITIONS,
  SUBTYPE_DEFINITIONS,
  OCCASION_DEFINITIONS,
} = require("../constants/analysisDefinitions.js");
const TEXT = require("../constants/analysisPrompt.js");

const COLOURS = COLOUR_LIST.map(({ name }) => name);
const FABRICS = FABRIC_LIST.map(({ name }) => name);

// The fabric answer when it can't tell - saved as "" (not known).
const UNKNOWN_FABRIC = "Not sure";

const DEFAULT_GENDER = "unisex";
const ITEM_COUNTS = ["one", "multiple", "none"];
const KINDS = ["clothing", "footwear"];

const ROLE_TITLES = {
  top: "Tops",
  bottom: "Bottoms",
  onepiece: "One-pieces (dresses, jumpsuits, playsuits)",
  outer: "Outerwear",
};

// "Brunch / lunch" -> "brunch_lunch": schema property names stay simple.
const occasionKey = (tag) =>
  tag.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_+|_+$/g, "");

const OCCASION_KEYS = OCCASION_TAGS.map(occasionKey);

const knownGender = (gender) => (subtypesByGender[gender] ? gender : DEFAULT_GENDER);

// { top: [...], bottom: [...], onepiece: [...], outer: [...] }
const clothingSubtypes = (gender) => subtypesByGender[knownGender(gender)];

const footwearSubtypes = (gender) =>
  footwearByGender[knownGender(gender)] || footwearByGender[DEFAULT_GENDER];

// Every subtype the answer may use, with its kind and (clothing) role.
// subtype -> { kind: "clothing", type } | { kind: "footwear" }
function subtypeIndex(gender) {
  const index = new Map();

  Object.entries(clothingSubtypes(gender)).forEach(([type, subtypes]) => {
    subtypes.forEach((subtype) => index.set(subtype, { kind: "clothing", type }));
  });

  footwearSubtypes(gender).forEach((subtype) => index.set(subtype, { kind: "footwear" }));

  return index;
}

const defined = (name, definition) => (definition ? `- ${name}: ${definition}` : `- ${name}`);

function subtypeLists(gender) {
  const clothing = Object.entries(clothingSubtypes(gender)).map(
    ([type, subtypes]) =>
      `${ROLE_TITLES[type] || type}:\n${subtypes.map((s) => defined(s, SUBTYPE_DEFINITIONS[s])).join("\n")}`
  );

  const footwear = `Footwear:\n${footwearSubtypes(gender).map((s) => `- ${s}`).join("\n")}`;

  return [...clothing, footwear].join("\n\n");
}

const patternList = () => PATTERNS.map((p) => defined(p, PATTERN_DEFINITIONS[p])).join("\n");

const fabricList = () =>
  [...FABRIC_LIST.map(({ name, description }) => defined(name, description)), `- ${UNKNOWN_FABRIC}`].join("\n");

// "Neutrals: White (pure, bright white...); Cream (...)", one line per group.
function colourList() {
  const groups = [...new Set(COLOUR_LIST.map(({ group }) => group))];

  return groups
    .map((group) => {
      const colours = COLOUR_LIST.filter((colour) => colour.group === group);
      return `- ${group}: ${colours.map(({ name, description }) => `${name} (${description})`).join("; ")}`;
    })
    .join("\n");
}

const occasionText = (tag) => {
  const { setting, fits, doesntFit } = OCCASION_DEFINITIONS[tag];
  return `${setting} Fits: ${fits}. Doesn't fit: ${doesntFit}.`;
};

const occasionList = () =>
  OCCASION_TAGS.map((tag, i) => `- ${OCCASION_KEYS[i]} = "${tag}": ${occasionText(tag)}`).join("\n");

function buildAnalysisPrompt(gender) {
  return [
    TEXT.INTRODUCTION,
    "The answer's fields:",
    TEXT.ITEM_COUNT,
    TEXT.PIECE_DESCRIPTION,
    TEXT.KIND_AND_SUBTYPE,
    subtypeLists(gender),
    `${TEXT.PATTERN}\n${patternList()}`,
    `${TEXT.FABRIC}\n${fabricList()}`,
    TEXT.COLOUR_DESCRIPTION,
    `${TEXT.COLOURS}\n${colourList()}`,
    `${TEXT.OCCASIONS}\n${occasionList()}`,
    `Examples:\n${TEXT.OCCASION_EXAMPLES.map((e) => `- ${e}`).join("\n")}`,
    TEXT.NAMES,
  ].join("\n\n");
}

const booleans = (keys) => ({
  type: "object",
  properties: Object.fromEntries(keys.map((key) => [key, { type: "boolean" }])),
  required: keys,
  propertyOrdering: keys,
});

// The descriptions come before the choices they explain; names come last,
// once the piece is settled.
const ANSWER_FIELDS = [
  "itemCount",
  "pieceDescription",
  "kind",
  "subtype",
  "pattern",
  "fabric",
  "colourDescription",
  "colors",
  "occasions",
  "name",
  "specificName",
];

function buildResponseSchema(gender) {
  return {
    type: "object",
    properties: {
      itemCount: { type: "string", enum: ITEM_COUNTS },
      pieceDescription: { type: "string" },
      kind: { type: "string", enum: KINDS },
      subtype: { type: "string", enum: [...subtypeIndex(gender).keys()] },
      pattern: { type: "string", enum: PATTERNS },
      fabric: { type: "string", enum: [...FABRICS, UNKNOWN_FABRIC] },
      colourDescription: { type: "string" },
      colors: {
        type: "array",
        items: { type: "string", enum: COLOURS },
        minItems: 1,
        maxItems: MAX_COLOURS,
      },
      occasions: booleans(OCCASION_KEYS),
      name: { type: "string" },
      specificName: { type: "string" },
    },
    required: ANSWER_FIELDS,
    propertyOrdering: ANSWER_FIELDS,
  };
}

// The follow-up when no occasion came back true: just the closest one.
function buildClosestOccasionPrompt() {
  return [
    TEXT.CLOSEST_OCCASION,
    OCCASION_TAGS.map((tag) => `- "${tag}": ${occasionText(tag)}`).join("\n"),
  ].join("\n\n");
}

const CLOSEST_OCCASION_SCHEMA = {
  type: "object",
  properties: { occasion: { type: "string", enum: OCCASION_TAGS } },
  required: ["occasion"],
};

module.exports = {
  COLOURS,
  FABRICS,
  UNKNOWN_FABRIC,
  OCCASION_KEYS,
  occasionKey,
  subtypeIndex,
  buildAnalysisPrompt,
  buildResponseSchema,
  buildClosestOccasionPrompt,
  CLOSEST_OCCASION_SCHEMA,
};
