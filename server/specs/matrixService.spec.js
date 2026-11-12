const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canonicalPairKey,
  pairKey,
  isCompatible,
  canStandAlone,
  fitsShape,
  satisfiesLayeringRules,
  isCliqueValid,
} = require("../services/matrixService.js");

const top = (subtype) => ({ type: "top", subtype });
const bottom = (subtype) => ({ type: "bottom", subtype });
const onepiece = (subtype) => ({ type: "onepiece", subtype });
const outer = (subtype) => ({ type: "outer", subtype });

// A small symmetric matrix: null = never, a number = compatible.
const baseline = {
  "Short t-shirt": { "Short t-shirt": null, "Chunky knit jumper": 80, Jeans: 90, Chinos: 70, Overalls: 85, "Puffer coat": 60, "Linen shirt": null },
  "Chunky knit jumper": { "Short t-shirt": 80, "Chunky knit jumper": null, Jeans: 85, Chinos: 80, Overalls: null, "Puffer coat": 70, "Linen shirt": null },
  "Linen shirt": { "Short t-shirt": null, "Chunky knit jumper": null, Jeans: 70, Chinos: 85, Overalls: null, "Puffer coat": 20, "Linen shirt": null },
  Jeans: { "Short t-shirt": 90, "Chunky knit jumper": 85, "Linen shirt": 70, Jeans: null, Chinos: null, Overalls: null, "Puffer coat": 75 },
  Chinos: { "Short t-shirt": 70, "Chunky knit jumper": 80, "Linen shirt": 85, Jeans: null, Chinos: null, Overalls: null, "Puffer coat": 60 },
  Overalls: { "Short t-shirt": 85, "Chunky knit jumper": null, "Linen shirt": null, Jeans: null, Chinos: null, Overalls: null, "Puffer coat": 70 },
  "Puffer coat": { "Short t-shirt": 60, "Chunky knit jumper": 70, "Linen shirt": 20, Jeans: 75, Chinos: 60, Overalls: 70, "Puffer coat": null },
};

test("canonicalPairKey and pairKey sort a pair the same way regardless of input order", () => {
  assert.deepEqual(canonicalPairKey("Jeans", "Blazer"), ["Blazer", "Jeans"]);
  assert.deepEqual(canonicalPairKey("Blazer", "Jeans"), ["Blazer", "Jeans"]);
  assert.equal(pairKey("Jeans", "Blazer"), "Blazer Jeans");
});

test("isCompatible is true when the matrix has a score, and false for null", () => {
  assert.equal(isCompatible(baseline, top("Short t-shirt"), bottom("Jeans")), true);
  assert.equal(isCompatible(baseline, top("Short t-shirt"), top("Chunky knit jumper")), true);
  assert.equal(isCompatible(baseline, top("Short t-shirt"), top("Linen shirt")), false);
});

test("a score of 0 still counts as compatible - 0 is a poor match, not 'never'", () => {
  const zero = { A: { B: 0 }, B: { A: 0 } };
  assert.equal(isCompatible(zero, top("A"), bottom("B")), true);
});

test("the same subtype twice is never compatible, whatever the matrix says", () => {
  const misconfigured = { "Short t-shirt": { "Short t-shirt": 50 } };
  assert.equal(isCompatible(misconfigured, top("Short t-shirt"), top("Short t-shirt")), false);
});

test("never-role pairs are rejected even if the matrix (wrongly) has a score", () => {
  const misconfigured = {
    Jeans: { Chinos: 50, Overalls: 50 },
    Chinos: { Jeans: 50 },
    Overalls: { Jeans: 50, Jumpsuit: 50 },
    Jumpsuit: { Overalls: 50 },
  };

  assert.equal(isCompatible(misconfigured, bottom("Jeans"), bottom("Chinos")), false);
  assert.equal(isCompatible(misconfigured, bottom("Jeans"), onepiece("Overalls")), false);
  assert.equal(isCompatible(misconfigured, onepiece("Overalls"), onepiece("Jumpsuit")), false);
});

test("a subtype missing from the matrix is never compatible", () => {
  assert.equal(isCompatible(baseline, top("Unknown top"), bottom("Jeans")), false);
});

test("canStandAlone checks the hardcoded requires-layering list", () => {
  const requiresLayeringSet = new Set(["Chunky knit jumper"]);

  assert.equal(canStandAlone(requiresLayeringSet, "Chunky knit jumper"), false);
  assert.equal(canStandAlone(requiresLayeringSet, "Short t-shirt"), true);
  assert.equal(canStandAlone(undefined, "Chunky knit jumper"), true);
});

test("fitsShape: a top that requires layering needs a 2-top shape", () => {
  const layeringRules = { requiresLayeringSet: new Set(["Chunky knit jumper"]) };

  assert.equal(fitsShape(top("Chunky knit jumper"), { top: 1, bottom: 1, onepiece: 0, outer: 0 }, layeringRules), false);
  assert.equal(fitsShape(top("Chunky knit jumper"), { top: 2, bottom: 1, onepiece: 0, outer: 0 }, layeringRules), true);
});

test("fitsShape: a onepiece that requires a top needs a shape with a top", () => {
  const layeringRules = { requiresTopSet: new Set(["Overalls"]) };

  assert.equal(fitsShape(onepiece("Overalls"), { top: 0, bottom: 0, onepiece: 1, outer: 1 }, layeringRules), false);
  assert.equal(fitsShape(onepiece("Overalls"), { top: 1, bottom: 0, onepiece: 1, outer: 0 }, layeringRules), true);
  assert.equal(fitsShape(onepiece("Jumpsuit"), { top: 0, bottom: 0, onepiece: 1, outer: 0 }, layeringRules), true);
});

test("fitsShape: an item that requires an outer needs a shape with an outer", () => {
  const layeringRules = { requiresOuterSet: new Set(["Ski/snow pants"]) };

  assert.equal(fitsShape(bottom("Ski/snow pants"), { top: 1, bottom: 1, onepiece: 0, outer: 0 }, layeringRules), false);
  assert.equal(fitsShape(bottom("Ski/snow pants"), { top: 1, bottom: 1, onepiece: 0, outer: 1 }, layeringRules), true);
  assert.equal(fitsShape(bottom("Jeans"), { top: 1, bottom: 1, onepiece: 0, outer: 0 }, layeringRules), true);
});

test("satisfiesLayeringRules rejects an item that requires an outer when there's none", () => {
  const layeringRules = { requiresOuterSet: new Set(["Jeans"]) };

  assert.equal(satisfiesLayeringRules([top("Short t-shirt"), bottom("Jeans")], layeringRules), false);
  assert.equal(satisfiesLayeringRules([top("Short t-shirt"), bottom("Jeans"), outer("Puffer coat")], layeringRules), true);
});

test("satisfiesLayeringRules never applies the layering rule to a bottom", () => {
  const layeringRules = { requiresLayeringSet: new Set(["Jeans"]) };
  assert.equal(satisfiesLayeringRules([top("Short t-shirt"), bottom("Jeans")], layeringRules), true);
});

test("isCliqueValid passes when every pair is compatible", () => {
  assert.equal(isCliqueValid([top("Short t-shirt"), bottom("Jeans"), outer("Puffer coat")], baseline), true);
});

test("isCliqueValid fails when any one pair is incompatible", () => {
  assert.equal(isCliqueValid([top("Short t-shirt"), top("Linen shirt"), bottom("Jeans")], baseline), false);
});

test("isCliqueValid rejects a lone top on the requires-layering list, and allows it once layered", () => {
  const layeringRules = { requiresLayeringSet: new Set(["Chunky knit jumper"]) };

  assert.equal(isCliqueValid([top("Chunky knit jumper"), bottom("Jeans")], baseline, layeringRules), false);
  assert.equal(
    isCliqueValid([top("Chunky knit jumper"), top("Short t-shirt"), bottom("Jeans")], baseline, layeringRules),
    true
  );
});

test("isCliqueValid rejects Overalls without a top, and allows them with one", () => {
  const layeringRules = { requiresTopSet: new Set(["Overalls"]) };

  assert.equal(isCliqueValid([onepiece("Overalls"), outer("Puffer coat")], baseline, layeringRules), false);
  assert.equal(isCliqueValid([onepiece("Overalls"), top("Short t-shirt")], baseline, layeringRules), true);
});

test("two puffer coats can never be layered together (same subtype)", () => {
  const items = [top("Short t-shirt"), bottom("Jeans"), outer("Puffer coat"), outer("Puffer coat")];
  assert.equal(isCliqueValid(items, baseline), false);
});
