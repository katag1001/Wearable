const test = require("node:test");
const assert = require("node:assert/strict");

const { describeOutfit, validateOutfit, countRoles } = require("../services/outfitEvaluator.js");

function item(overrides) {
  return {
    _id: overrides.subtype,
    type: "top",
    subtype: "Short t-shirt",
    min_temp: 15,
    max_temp: 30,
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
    item({
      subtype: "Short t-shirt",
      type: "top",
      min_temp: 15,
      max_temp: 30,
      colors: ["Cream"],
      styles: ["plain"],
      tags: ["Everyday"],
    }),
    item({
      subtype: "Jeans",
      type: "bottom",
      min_temp: 5,
      max_temp: 22,
      colors: ["Tan"],
      styles: ["plain"],
      tags: ["Everyday"],
    }),
  ];

  const result = describeOutfit(items, { isUserMade: false });

  assert.equal(result.min_temp, 15);
  assert.equal(result.max_temp, 22);
  assert.deepEqual(result.clothes, ["Short t-shirt", "Jeans"]);
  assert.equal(result.topCount, 1);
  assert.equal(result.bottomCount, 1);
  assert.equal(result.outerCount, 0);
  assert.equal(result.hasOuter, false);
  assert.deepEqual(new Set(result.colors), new Set(["Cream", "Tan"]));
  assert.deepEqual(result.tags, ["Everyday"]);
});

test("describeOutfit returns null for a non-overlapping auto-search candidate", () => {
  const items = [
    item({ subtype: "a", type: "top", min_temp: 20, max_temp: 30 }),
    item({ subtype: "b", type: "bottom", min_temp: 0, max_temp: 10 }),
  ];

  assert.equal(describeOutfit(items, { isUserMade: false }), null);
});

test("describeOutfit never returns null for a user-made outfit", () => {
  const items = [
    item({ subtype: "a", type: "top", min_temp: 20, max_temp: 30 }),
    item({ subtype: "b", type: "bottom", min_temp: 0, max_temp: 10 }),
  ];

  const result = describeOutfit(items, { isUserMade: true });

  assert.notEqual(result, null);
  assert.equal(result.min_temp, 0);
  assert.equal(result.max_temp, 30);
});

test("validateOutfit fails when the pattern check fails even if the matrix passes", () => {
  const baseline = {
    "Short t-shirt": { "Short t-shirt": 5, Jeans: 5 },
    Jeans: { Jeans: 5, "Short t-shirt": 5 },
  };

  const items = [
    item({ subtype: "Short t-shirt", type: "top", styles: ["patterned"] }),
    item({ subtype: "Jeans", type: "bottom", styles: ["patterned"] }),
  ];

  assert.equal(validateOutfit(items, baseline, null), false);
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

test("validateOutfit passes a clean, compatible, single-palette outfit", () => {
  const baseline = {
    "Short t-shirt": { "Short t-shirt": 5, Jeans: 5 },
    Jeans: { Jeans: 5, "Short t-shirt": 5 },
  };

  const items = [
    item({ subtype: "Short t-shirt", type: "top", colors: ["Cream"], styles: ["plain"] }),
    item({ subtype: "Jeans", type: "bottom", colors: ["Tan"], styles: ["plain"] }),
  ];

  assert.equal(validateOutfit(items, baseline, null), true);
});
