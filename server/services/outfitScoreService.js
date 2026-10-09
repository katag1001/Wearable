// server/services/outfitScoreService.js
//
// Pure scoring logic: how good is a match? No DB access here.
//
//  - A pair's score is its baseline (matrix file) plus the user's personal
//    adjustment, kept between 0 and 100.
//  - An automatic outfit's score is a blend of its pair scores and a score
//    for how many colours it has, given the user's colour level (see
//    constants/scoring.js), worked out once when the match is created.
//
// Scores never decide whether items can be matched - that's
// matrixService.isCompatible, which never reads personal adjustments.

const { pairKey } = require("./matrixService.js");
const {
  MIN_SCORE,
  MAX_SCORE,
  AVERAGE_PAIR_WEIGHT,
  LOWEST_PAIR_WEIGHT,
  PAIR_SCORE_WEIGHT,
  COLOUR_SCORE_WEIGHT,
  COLOUR_COUNT_SCORES,
  SINGLE_ITEM_SCORE,
} = require("../constants/scoring.js");
const { DEFAULT_COLOUR_LEVEL } = require("../utils/colorPalettes.js");

function clampScore(value) {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));
}

// Keeps a stored adjustment within the range that keeps baseline +
// adjustment between 0 and 100, so no hidden "reserve" builds up beyond
// either end.
function clampAdjustment(baseline, adjustment) {
  return clampScore(baseline + adjustment) - baseline;
}

// Baseline + personal adjustment, limited to 0-100 again in case a baseline
// has been edited since the adjustment was stored. Undefined for a pair
// with no baseline score (a pair that can't be matched).
function getPairScore(baselineMatrix, adjustments, subtypeA, subtypeB) {
  const baseline = baselineMatrix?.[subtypeA]?.[subtypeB];

  if (typeof baseline !== "number") {
    return undefined;
  }

  const adjustment = adjustments?.get(pairKey(subtypeA, subtypeB)) || 0;

  return clampScore(baseline + adjustment);
}

// Score for the outfit's number of distinct colours at the user's colour
// level. Counts past the end of the level's list use its last entry.
function computeColourScore(items, colourLevel) {
  const scores = COLOUR_COUNT_SCORES[colourLevel] || COLOUR_COUNT_SCORES[DEFAULT_COLOUR_LEVEL];
  const colourCount = new Set(items.flatMap((item) => item.colors || [])).size;
  const index = Math.min(Math.max(colourCount, 1), scores.length) - 1;

  return scores[index];
}

// 70% average + 30% lowest of every scoreable pair, not rounded. Null for
// an outfit with no scoreable pairs (a single item).
function computePairBlend(items, baselineMatrix, adjustments) {
  const pairScores = [];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const score = getPairScore(baselineMatrix, adjustments, items[i].subtype, items[j].subtype);

      if (score !== undefined) {
        pairScores.push(score);
      }
    }
  }

  if (!pairScores.length) {
    return null;
  }

  const average = pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length;
  const lowest = Math.min(...pairScores);

  return average * AVERAGE_PAIR_WEIGHT + lowest * LOWEST_PAIR_WEIGHT;
}

// Pair blend weighted with the colour score, rounded to a whole number. An
// outfit with no scoreable pairs (a single item) gets SINGLE_ITEM_SCORE,
// with no colour score. Pass `pairBlend` if it's already been worked out.
function computeOutfitScore(
  items,
  baselineMatrix,
  adjustments,
  colourLevel,
  pairBlend = computePairBlend(items, baselineMatrix, adjustments)
) {
  if (pairBlend === null) {
    return SINGLE_ITEM_SCORE;
  }

  const colourScore = computeColourScore(items, colourLevel);

  return Math.round(pairBlend * PAIR_SCORE_WEIGHT + colourScore * COLOUR_SCORE_WEIGHT);
}

module.exports = {
  clampScore,
  clampAdjustment,
  getPairScore,
  computeColourScore,
  computePairBlend,
  computeOutfitScore,
};
