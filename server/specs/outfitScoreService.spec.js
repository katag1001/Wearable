const test = require("node:test");
const assert = require("node:assert/strict");

const {
  clampScore,
  clampAdjustment,
  getPairScore,
  computeOutfitScore,
} = require("../services/outfitScoreService.js");
const { SINGLE_ITEM_SCORE } = require("../constants/scoring.js");

const baseline = {
  A: { A: null, B: 80, C: 80, D: 20 },
  B: { A: 80, B: null, C: 80, D: 80 },
  C: { A: 80, B: 80, C: null, D: 80 },
  D: { A: 20, B: 80, C: 80, D: null },
};

const item = (subtype) => ({ subtype });

test("clampScore keeps a value between 0 and 100", () => {
  assert.equal(clampScore(-5), 0);
  assert.equal(clampScore(105), 100);
  assert.equal(clampScore(42), 42);
});

test("clampAdjustment stops an adjustment pushing baseline + adjustment past 100 or below 0", () => {
  assert.equal(clampAdjustment(95, 50), 5);
  assert.equal(clampAdjustment(10, -30), -10);
  assert.equal(clampAdjustment(50, 5), 5);
});

test("getPairScore is baseline + adjustment, kept within 0-100", () => {
  const adjustments = new Map([["A B", 15], ["A D", -50]]);

  assert.equal(getPairScore(baseline, adjustments, "A", "B"), 95);
  assert.equal(getPairScore(baseline, adjustments, "B", "A"), 95);
  assert.equal(getPairScore(baseline, adjustments, "A", "D"), 0);
  assert.equal(getPairScore(baseline, null, "A", "C"), 80);
});

test("getPairScore is undefined for a pair that can't be matched", () => {
  assert.equal(getPairScore(baseline, null, "A", "A"), undefined);
  assert.equal(getPairScore(baseline, null, "A", "Missing"), undefined);
});

test("computeOutfitScore blends 70% average with 30% lowest pair", () => {
  // Pairs: A-B 80, A-C 80, A-D 20, B-C 80, B-D 80, C-D 80
  // average 70, lowest 20 -> 0.7 * 70 + 0.3 * 20 = 55
  const items = [item("A"), item("B"), item("C"), item("D")];
  assert.equal(computeOutfitScore(items, baseline, null), 55);
});

test("computeOutfitScore uses the user's adjustments and rounds to a whole number", () => {
  const adjustments = new Map([["A B", 5]]);
  // single pair 85 -> 0.7 * 85 + 0.3 * 85 = 85
  assert.equal(computeOutfitScore([item("A"), item("B")], baseline, adjustments), 85);
  assert.equal(Number.isInteger(computeOutfitScore([item("A"), item("B"), item("D")], baseline, null)), true);
});

test("computeOutfitScore gives a single item the fixed single-item score", () => {
  assert.equal(computeOutfitScore([item("A")], baseline, null), SINGLE_ITEM_SCORE);
});
