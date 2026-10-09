const test = require("node:test");
const assert = require("node:assert/strict");

const {
  clampScore,
  clampAdjustment,
  getPairScore,
  computeColourScore,
  computeOutfitScore,
} = require("../services/outfitScoreService.js");
const { SINGLE_ITEM_SCORE } = require("../constants/scoring.js");

const baseline = {
  A: { A: null, B: 80, C: 80, D: 20 },
  B: { A: 80, B: null, C: 80, D: 80 },
  C: { A: 80, B: 80, C: null, D: 80 },
  D: { A: 20, B: 80, C: 80, D: null },
};

const item = (subtype, colors = ["Black"]) => ({ subtype, colors });
const withColours = (count) => [item("A", ["Black", "White", "Grey", "Navy", "Red", "Cream", "Gold", "Teal"].slice(0, count))];

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

test("computeColourScore scores the number of distinct colours for each level", () => {
  const scores = (level, counts) => counts.map((count) => computeColourScore(withColours(count), level));

  assert.deepEqual(scores("min", [1, 2, 3, 4]), [85, 75, 85, 75]);
  assert.deepEqual(scores("mid", [1, 2, 3, 4, 5, 6]), [75, 65, 85, 85, 65, 55]);
  assert.deepEqual(scores("max", [1, 2, 3, 4, 5, 6, 7, 8]), [55, 65, 75, 85, 85, 75, 65, 65]);
});

test("computeColourScore counts a colour shared by several items once", () => {
  const items = [item("A", ["Black", "White"]), item("B", ["Black"]), item("C", ["White", "Grey"])];

  assert.equal(computeColourScore(items, "mid"), 85);
});

test("computeColourScore falls back to the default level for a missing or unknown level", () => {
  assert.equal(computeColourScore(withColours(3), null), 85);
  assert.equal(computeColourScore(withColours(1), "not-a-level"), 75);
});

test("computeOutfitScore weights the pair blend 60% and the colour score 40%", () => {
  // Pairs: A-B 80, A-C 80, A-D 20, B-C 80, B-D 80, C-D 80
  // pair blend: average 70, lowest 20 -> 0.7 * 70 + 0.3 * 20 = 55
  // 1 colour at mid -> 75; 0.6 * 55 + 0.4 * 75 = 63
  const items = [item("A"), item("B"), item("C"), item("D")];
  assert.equal(computeOutfitScore(items, baseline, null, "mid"), 63);
});

test("computeOutfitScore uses the user's adjustments and rounds to a whole number", () => {
  const adjustments = new Map([["A B", 5]]);
  // single pair 85; 3 colours at max -> 75; 0.6 * 85 + 0.4 * 75 = 81
  const items = [item("A", ["Black", "White"]), item("B", ["Grey"])];
  assert.equal(computeOutfitScore(items, baseline, adjustments, "max"), 81);
  assert.equal(Number.isInteger(computeOutfitScore([item("A"), item("B"), item("D")], baseline, null, "min")), true);
});

test("computeOutfitScore gives a single item the fixed single-item score, whatever its colours", () => {
  assert.equal(computeOutfitScore([item("A")], baseline, null, "max"), SINGLE_ITEM_SCORE);
  assert.equal(computeOutfitScore(withColours(4), baseline, null, "min"), SINGLE_ITEM_SCORE);
});
