// server/services/outfitScoreService.js
//
// Pure scoring logic: how good is a match? No DB access here.
//
//  - A pair's score is its baseline (matrix file) plus the user's personal
//    adjustment, kept between 0 and 100.
//  - An automatic outfit's score is a blend of its pair scores and its
//    colour score (colour count, palette tier, favourite palettes, bright
//    colours - see constants/scoring.js), worked out once when the match is
//    created.
//
// Scores never decide whether items can be matched - that's
// matrixService.isCompatible, which never reads personal adjustments.

const { pairKey } = require("./matrixService.js");
const {
  MIN_SCORE,
  MAX_SCORE,
  AVERAGE_PAIR_WEIGHT,
  LOWEST_PAIR_WEIGHT,
  MIN_PAIR_SCORE,
  PAIR_SCORE_WEIGHT,
  COLOUR_SCORE_WEIGHT,
  COLOUR_COUNT_SCORES,
  PALETTE_TIER_SCORES,
  FAVOURITE_PALETTE_BONUS,
  BRIGHT_COLOUR_ADJUSTMENTS,
  SINGLE_ITEM_SCORE,
  MAX_AUTO_SCORE,
} = require("../constants/scoring.js");
const { allPalettes, paletteFits, BRIGHT_COLOURS } = require("../utils/colorPalettes.js");

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

function distinctColours(items) {
  return [...new Set(items.flatMap((item) => item.colors || []))];
}

// The entry for `count` in a per-level list, using the last entry for
// anything past the end.
function entryFor(list, count) {
  return list[Math.min(count, list.length - 1)];
}

// Score for the outfit's number of distinct colours at the user's colour
// level.
function computeColourCountScore(colours, level) {
  return entryFor(COLOUR_COUNT_SCORES[level], Math.max(colours.length, 1) - 1);
}

// Best tier score among the level's palettes the colours fit. 0 if they fit
// none (the palette check means an automatic outfit always fits one).
function computePaletteTierScore(colours, colorRules) {
  const tierScores = PALETTE_TIER_SCORES[colorRules.level];

  return colorRules.palettes
    .filter((palette) => paletteFits(palette, colours))
    .reduce((best, palette) => Math.max(best, tierScores[palette.tier]), 0);
}

// FAVOURITE_PALETTE_BONUS if the colours fit one of the user's favourite
// palettes, whichever levels that palette is used at.
function computeFavouriteBonus(colours, favouritePalettes = []) {
  const favourites = new Set(favouritePalettes);
  const fitsFavourite = allPalettes.some(
    (palette) => favourites.has(palette.id) && paletteFits(palette, colours)
  );

  return fitsFavourite ? FAVOURITE_PALETTE_BONUS : 0;
}

function computeBrightAdjustment(colours, level) {
  const brightCount = colours.filter((colour) => BRIGHT_COLOURS.includes(colour)).length;

  return entryFor(BRIGHT_COLOUR_ADJUSTMENTS[level], brightCount);
}

// Average of the colour-count and palette tier scores, plus the favourite
// bonus and bright-colour adjustment, kept between 0 and 100. Not rounded.
// `colorRules` is the user's resolved level (utils/colorPalettes.js
// getColorRules).
function computeColourScore(items, colorRules, favouritePalettes = []) {
  const colours = distinctColours(items);
  const { level } = colorRules;

  const average =
    (computeColourCountScore(colours, level) + computePaletteTierScore(colours, colorRules)) / 2;

  return clampScore(
    average + computeFavouriteBonus(colours, favouritePalettes) + computeBrightAdjustment(colours, level)
  );
}

// 70% average + 30% lowest of every scoreable pair, not rounded - unless a
// pair is below MIN_PAIR_SCORE, in which case it's that pair's score. Null
// for an outfit with no scoreable pairs (a single item).
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

  if (lowest < MIN_PAIR_SCORE) {
    return lowest;
  }

  return average * AVERAGE_PAIR_WEIGHT + lowest * LOWEST_PAIR_WEIGHT;
}

// The final score for a pair blend and colour score, rounded and capped at
// MAX_AUTO_SCORE.
function combineScores(pairBlend, colourScore) {
  return Math.min(
    MAX_AUTO_SCORE,
    Math.round(pairBlend * PAIR_SCORE_WEIGHT + colourScore * COLOUR_SCORE_WEIGHT)
  );
}

// Pair blend weighted with the colour score, rounded to a whole number. An
// outfit with no scoreable pairs (a single item) gets SINGLE_ITEM_SCORE,
// with no colour score. `context` is matchService's matching context
// ({ baselineMatrix, adjustments, colorRules, favouritePalettes }).
function computeOutfitScore(items, context) {
  const pairBlend = computePairBlend(items, context.baselineMatrix, context.adjustments);

  if (pairBlend === null) {
    return SINGLE_ITEM_SCORE;
  }

  return combineScores(pairBlend, computeColourScore(items, context.colorRules, context.favouritePalettes));
}

module.exports = {
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
};
