const test = require("node:test");
const assert = require("node:assert/strict");

const {
  clampScore,
  clampAdjustment,
  getPairScore,
  computeColourCountScore,
  computePaletteTierScore,
  computeFavouriteBonus,
  computeBrightAdjustment,
  computeColourScore,
  computePairBlend,
  combineScores,
  computeOutfitScore,
} = require("../services/outfitScoreService.js");
const { SINGLE_ITEM_SCORE, FAVOURITE_PALETTE_BONUS } = require("../constants/scoring.js");
const { allPalettes } = require("../utils/colorPalettes.js");

const baseline = {
  A: { A: null, B: 80, C: 80, D: 20 },
  B: { A: 80, B: null, C: 80, D: 80 },
  C: { A: 80, B: 80, C: null, D: 80 },
  D: { A: 20, B: 80, C: 80, D: null },
};

const item = (subtype, colors = ["Cream"]) => ({ subtype, colors });

// Made-up palettes, so scores don't depend on the real palette file.
const rules = (level, palettes) => ({ palettes, maxColors: null, level });
const palette = (tier, colours) => ({ id: `test-${tier}`, tier, levels: ["min", "mid", "max"], colours });
const neutrals = ["Cream", "Camel", "Tan", "White", "Brown", "Navy", "Grey", "Black"];

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

test("computeColourCountScore scores the number of distinct colours for each level", () => {
  const scores = (level, counts) => counts.map((count) => computeColourCountScore(neutrals.slice(0, count), level));

  assert.deepEqual(scores("min", [1, 2, 3, 4]), [65, 75, 85, 65]);
  assert.deepEqual(scores("mid", [1, 2, 3, 4, 5, 6]), [65, 55, 85, 85, 65, 55]);
  assert.deepEqual(scores("max", [1, 2, 3, 4, 5, 6, 7, 8]), [25, 45, 75, 85, 75, 65, 45, 45]);
});

test("computePaletteTierScore uses the best tier among the palettes the colours fit", () => {
  const palettes = [palette("classic", ["Navy", "Cream"]), palette("bold", ["Navy", "Cream", "Fuchsia"])];

  // Navy + Cream fits both: min takes classic (95), max takes bold (90).
  assert.equal(computePaletteTierScore(["Navy", "Cream"], rules("min", palettes)), 95);
  assert.equal(computePaletteTierScore(["Navy", "Cream"], rules("max", palettes)), 90);
  // With Fuchsia only the bold palette fits.
  assert.equal(computePaletteTierScore(["Navy", "Fuchsia"], rules("min", palettes)), 30);
  assert.equal(computePaletteTierScore(["Navy", "Fuchsia"], rules("mid", palettes)), 65);
  // Fits nothing.
  assert.equal(computePaletteTierScore(["Red"], rules("mid", palettes)), 0);
});

test("computeFavouriteBonus applies when the colours fit a favourite palette, at any level", () => {
  const favourite = allPalettes.find((p) => p.id === "navy-cream-white");

  assert.equal(computeFavouriteBonus(["Navy", "White"], [favourite.id]), FAVOURITE_PALETTE_BONUS);
  assert.equal(computeFavouriteBonus(["Navy", "Red"], [favourite.id]), 0);
  assert.equal(computeFavouriteBonus(["Navy", "White"], []), 0);
  assert.equal(computeFavouriteBonus(["Navy", "White"], ["not-a-palette"]), 0);
});

test("computeBrightAdjustment depends on the number of bright colours and the level", () => {
  const adjustments = (level) => [
    [],
    ["Red"],
    ["Red", "Yellow"],
    ["Red", "Yellow", "Fuchsia"],
  ].map((brights) => computeBrightAdjustment(["Navy", ...brights], level));

  assert.deepEqual(adjustments("min"), [0, -5, -20, -20]);
  assert.deepEqual(adjustments("mid"), [0, 5, -15, -15]);
  assert.deepEqual(adjustments("max"), [0, 0, 0, 0]);
});

test("computeColourScore averages count and tier, then adds the favourite bonus and bright adjustment", () => {
  const palettes = [palette("common", ["Navy", "Cream", "Red"])];
  const items = [item("A", ["Navy"]), item("B", ["Red"]), item("C", ["Cream", "Navy"])];

  // 3 colours at mid: count 85, common 85 -> 85; one bright colour +5 = 90.
  assert.equal(computeColourScore(items, rules("mid", palettes)), 90);
  // At min: count 85, common 60 -> 72.5; one bright colour -5 = 67.5.
  assert.equal(computeColourScore(items, rules("min", palettes)), 67.5);
});

test("computeColourScore adds the favourite bonus and stays within 0-100", () => {
  const items = [item("A", ["Navy"]), item("B", ["Cream"]), item("C", ["White"])];
  const real = rules("min", [palette("classic", ["Navy", "Cream", "White"])]);

  // 3 colours at min: count 85, classic 95 -> 90; favourite +10 = 100.
  assert.equal(computeColourScore(items, real, ["navy-cream-white"]), 100);
  assert.equal(computeColourScore(items, real, []), 90);
});

test("computePairBlend blends 70% average with 30% lowest pair, unrounded", () => {
  const above = {
    A: { A: null, B: 80, C: 60 },
    B: { A: 80, B: null, C: 70 },
    C: { A: 60, B: 70, C: null },
  };
  // average 70, lowest 60 -> 0.7 * 70 + 0.3 * 60 = 67
  assert.equal(computePairBlend([item("A"), item("B"), item("C")], above, null), 67);
});

test("computePairBlend is the lowest pair score when any pair is below MIN_PAIR_SCORE", () => {
  // Pairs: A-B 80, A-C 80, A-D 20, B-C 80, B-D 80, C-D 80 -> lowest 20
  assert.equal(computePairBlend([item("A"), item("B"), item("C"), item("D")], baseline, null), 20);
});

test("computePairBlend is null for an outfit with no scoreable pairs", () => {
  assert.equal(computePairBlend([item("A")], baseline, null), null);
});

test("combineScores weights the pair blend 60% and the colour score 40%, rounded", () => {
  assert.equal(combineScores(80, 70), 76);
  assert.equal(combineScores(67, 72.5), 69);
});

test("computeOutfitScore scores a whole outfit from the matching context", () => {
  const context = {
    baselineMatrix: baseline,
    adjustments: new Map([["A B", 5]]),
    colorRules: rules("mid", [palette("common", ["Cream", "Navy"])]),
    favouritePalettes: [],
  };

  // pair 85; 2 colours at mid: count 55, common 85 -> 70; 0.6 * 85 + 0.4 * 70 = 79
  assert.equal(computeOutfitScore([item("A", ["Cream"]), item("B", ["Navy"])], context), 79);
});

test("computeOutfitScore gives a single item the fixed single-item score, whatever its colours", () => {
  const context = { baselineMatrix: baseline, adjustments: null, colorRules: rules("max", []) };

  assert.equal(computeOutfitScore([item("A", ["Fuchsia", "Lime Green"])], context), SINGLE_ITEM_SCORE);
});
