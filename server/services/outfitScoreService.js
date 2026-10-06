// server/services/outfitScoreService.js
//
// Pure scoring logic: how good is a match? No DB access here.
//
//  - A pair's score is its baseline (matrix file) plus the user's personal
//    adjustment, kept between 0 and 100.
//  - An automatic outfit's score is a blend of its pair scores (see
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
  SINGLE_ITEM_SCORE,
} = require("../constants/scoring.js");

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

// Blend of every scoreable pair: 70% average + 30% lowest, rounded to a
// whole number. An outfit with no scoreable pairs (a single item) gets
// SINGLE_ITEM_SCORE.
function computeOutfitScore(items, baselineMatrix, adjustments) {
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
    return SINGLE_ITEM_SCORE;
  }

  const average = pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length;
  const lowest = Math.min(...pairScores);

  return Math.round(average * AVERAGE_PAIR_WEIGHT + lowest * LOWEST_PAIR_WEIGHT);
}

module.exports = {
  clampScore,
  clampAdjustment,
  getPairScore,
  computeOutfitScore,
};
