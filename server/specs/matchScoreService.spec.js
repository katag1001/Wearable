const test = require("node:test");
const assert = require("node:assert/strict");

const { pairsForItems, getBaselineMatrix } = require("../services/matchScoreService.js");
const { matchScoreBaseline } = require("../constants/matchScoreBaseline.js");

test("pairsForItems lists every cross-item pair and nothing else", () => {
  const items = [
    { type: "top", subtype: "A" },
    { type: "bottom", subtype: "B" },
    { type: "outer", subtype: "C" },
  ];

  const pairs = pairsForItems(items).map(([a, b]) => `${a.subtype}-${b.subtype}`);

  assert.deepEqual(new Set(pairs), new Set(["A-B", "A-C", "B-C"]));
});

test("pairsForItems still pairs two physically different items that share a subtype", () => {
  const items = [
    { type: "outer", subtype: "Puffer coat" },
    { type: "outer", subtype: "Puffer coat" },
    { type: "bottom", subtype: "Jeans" },
  ];

  const pairs = pairsForItems(items).map(([a, b]) => `${a.subtype}-${b.subtype}`);

  assert.equal(pairs.filter((p) => p === "Puffer coat-Puffer coat").length, 1);
});

test("getBaselineMatrix picks the gender's matrix and falls back to unisex", () => {
  assert.equal(getBaselineMatrix("man"), matchScoreBaseline.man);
  assert.equal(getBaselineMatrix("woman"), matchScoreBaseline.woman);
  assert.equal(getBaselineMatrix("unknown"), matchScoreBaseline.unisex);
});
