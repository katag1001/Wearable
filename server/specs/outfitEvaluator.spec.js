const test = require("node:test");
const assert = require("node:assert/strict");

const { describeOutfit, validateOutfit, countRoles } = require("../services/outfitEvaluator.js");
const { getColorRules } = require("../utils/colorPalettes.js");
const { computePresetTemperatureRange } = require("../services/presetTemperatureService.js");

const colorRules = getColorRules("mid");

function item(overrides) {
  return {
    _id: overrides.subtype,
    type: "top",
    subtype: "Short t-shirt",
    colors: ["Cream"],
    styles: ["plain"],
    tags: ["Everyday"],
    spring: true,
    summer: true,
    autumn: true,
    winter: true,
    ...overrides,
  };
}

test("countRoles tallies each type independently", () => {
  const items = [
    item({ subtype: "a", type: "top" }),
    item({ subtype: "b", type: "top" }),
    item({ subtype: "c", type: "bottom" }),
  ];

  assert.deepEqual(countRoles(items), {
    topCount: 2,
    bottomCount: 1,
    onepieceCount: 0,
    outerCount: 0,
  });
});

test("describeOutfit computes temperature, role counts, hasOuter, and merges tags/colours/styles", () => {
  const items = [
    item({ subtype: "Short t-shirt", type: "top", colors: ["Cream"], styles: ["plain"], tags: ["Everyday"] }),
    item({ subtype: "Jeans", type: "bottom", colors: ["Tan"], styles: ["plain"], tags: ["Everyday"] }),
  ];

  const result = describeOutfit(items, { isUserMade: false });
  const { min_temp, max_temp } = computePresetTemperatureRange(items);

  assert.equal(result.min_temp, min_temp);
  assert.equal(result.max_temp, max_temp);
  assert.deepEqual(result.clothes, ["Short t-shirt", "Jeans"]);
  assert.equal(result.topCount, 1);
  assert.equal(result.bottomCount, 1);
  assert.equal(result.outerCount, 0);
  assert.equal(result.hasOuter, false);
  assert.deepEqual(new Set(result.colors), new Set(["Cream", "Tan"]));
  assert.deepEqual(result.tags, ["Everyday"]);
});

test("describeOutfit never rejects an outfit because of temperature", () => {
  const items = [
    item({ subtype: "Linen shirt", type: "top" }),
    item({ subtype: "Leather trousers", type: "bottom" }),
    item({ subtype: "Puffer coat", type: "outer" }),
  ];

  assert.notEqual(describeOutfit(items, { isUserMade: false }), null);
});

test("describeOutfit ignores any temperature range left on the items themselves", () => {
  const items = [
    item({ subtype: "Short t-shirt", type: "top", min_temp: -20, max_temp: -10 }),
    item({ subtype: "Jeans", type: "bottom", min_temp: 40, max_temp: 50 }),
  ];

  const { min_temp, max_temp } = computePresetTemperatureRange(items);
  const result = describeOutfit(items, { isUserMade: false });

  assert.equal(result.min_temp, min_temp);
  assert.equal(result.max_temp, max_temp);
});

test("describeOutfit passes the temperature preference through to the range", () => {
  const items = [
    item({ subtype: "Short t-shirt", type: "top" }),
    item({ subtype: "Jeans", type: "bottom" }),
  ];

  const result = describeOutfit(items, { isUserMade: false, temperaturePreference: "cold" });
  const expected = computePresetTemperatureRange(items, "cold");

  assert.equal(result.min_temp, expected.min_temp);
  assert.equal(result.max_temp, expected.max_temp);
});

test("validateOutfit fails when the pattern check fails even if the matrix passes", () => {
  const baseline = {
    "Short t-shirt": { "Short t-shirt": null, Jeans: 50 },
    Jeans: { Jeans: null, "Short t-shirt": 50 },
  };

  const items = [
    item({ subtype: "Short t-shirt", type: "top", styles: ["patterned"] }),
    item({ subtype: "Jeans", type: "bottom", styles: ["patterned"] }),
  ];

  assert.equal(validateOutfit(items, { baselineMatrix: baseline, colorRules }), false);
});

test("describeOutfit ANDs season flags across every item", () => {
  const items = [
    item({ subtype: "a", type: "top", spring: true, summer: false, autumn: true, winter: false }),
    item({ subtype: "b", type: "bottom", spring: true, summer: true, autumn: false, winter: false }),
  ];

  const result = describeOutfit(items, { isUserMade: false });

  assert.equal(result.spring, true);
  assert.equal(result.summer, false);
  assert.equal(result.autumn, false);
  assert.equal(result.winter, false);
});

test("describeOutfit rejects an auto-search candidate with no shared season at all", () => {
  const items = [
    item({ subtype: "a", type: "top", spring: true, summer: false, autumn: false, winter: false }),
    item({ subtype: "b", type: "bottom", spring: false, summer: true, autumn: false, winter: false }),
  ];

  assert.equal(describeOutfit(items, { isUserMade: false }), null);
});

test("describeOutfit never rejects a user-made outfit for having no shared season", () => {
  const items = [
    item({ subtype: "a", type: "top", spring: true, summer: false, autumn: false, winter: false }),
    item({ subtype: "b", type: "bottom", spring: false, summer: true, autumn: false, winter: false }),
  ];

  assert.notEqual(describeOutfit(items, { isUserMade: true }), null);
});

test("describeOutfit keeps only the tags every item has", () => {
  const items = [
    item({ subtype: "a", type: "top", tags: ["Work", "Everyday", "Party"] }),
    item({ subtype: "b", type: "bottom", tags: ["Everyday", "Work"] }),
    item({ subtype: "c", type: "outer", tags: ["Work", "Everyday"] }),
  ];

  const result = describeOutfit(items, { isUserMade: false });

  assert.deepEqual(new Set(result.tags), new Set(["Work", "Everyday"]));
});

test("describeOutfit rejects an auto-search candidate with no shared tag", () => {
  const items = [
    item({ subtype: "a", type: "top", tags: ["Work"] }),
    item({ subtype: "b", type: "bottom", tags: ["Party"] }),
  ];

  assert.equal(describeOutfit(items, { isUserMade: false }), null);
});

test("describeOutfit rejects an auto-search candidate containing an untagged item", () => {
  const items = [
    item({ subtype: "a", type: "top", tags: ["Work"] }),
    item({ subtype: "b", type: "bottom", tags: [] }),
  ];

  assert.equal(describeOutfit(items, { isUserMade: false }), null);
});

test("describeOutfit keeps a user-made outfit with no shared tag, with an empty tag list", () => {
  const items = [
    item({ subtype: "a", type: "top", tags: ["Work"] }),
    item({ subtype: "b", type: "bottom", tags: ["Party"] }),
  ];

  const result = describeOutfit(items, { isUserMade: true });

  assert.notEqual(result, null);
  assert.deepEqual(result.tags, []);
});

test("describeOutfit gives a user-made outfit the tags its items share", () => {
  const items = [
    item({ subtype: "a", type: "top", tags: ["Work", "Party"] }),
    item({ subtype: "b", type: "bottom", tags: ["Party"] }),
  ];

  assert.deepEqual(describeOutfit(items, { isUserMade: true }).tags, ["Party"]);
});

test("validateOutfit passes a clean, compatible, single-palette outfit", () => {
  const baseline = {
    "Short t-shirt": { "Short t-shirt": null, Jeans: 50 },
    Jeans: { Jeans: null, "Short t-shirt": 50 },
  };

  const items = [
    item({ subtype: "Short t-shirt", type: "top", colors: ["Cream"], styles: ["plain"] }),
    item({ subtype: "Jeans", type: "bottom", colors: ["Tan"], styles: ["plain"] }),
  ];

  assert.equal(validateOutfit(items, { baselineMatrix: baseline, colorRules }), true);
});
