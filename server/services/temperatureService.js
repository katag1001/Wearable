// server/services/temperatureService.js
//
// Matching an outfit's temperature range against today's weather. Pure -
// no DB access here.
//
// A match's own range is worked out from its subtypes when the match is
// created - see presetTemperatureService.js and
// context/temperature-ranges.md. Clothing items have no range of their own.

const { CLOSE_MATCH_MIN, CLOSE_MATCH_MAX } = require("../constants/todayOutfits.js");

// How much of the outfit's own temperature span falls inside today's range.
// Kept for reference/tests; today's list uses todayCoverageFraction.
// A point range (min === max) counts as full overlap if that point falls
// within today's range, and zero otherwise.
function temperatureOverlapFraction(outfitRange, todayRange) {
  const overlapStart = Math.max(outfitRange.min, todayRange.min);
  const overlapEnd = Math.min(outfitRange.max, todayRange.max);
  const outfitSpan = outfitRange.max - outfitRange.min;

  if (outfitSpan === 0) {
    return overlapStart <= overlapEnd ? 1 : 0;
  }

  const overlap = Math.max(0, overlapEnd - overlapStart);

  return overlap / outfitSpan;
}

// How much of TODAY's temperature range (the daytime min-max) the outfit's
// range covers: 1 when the outfit suits every temperature of the day, 0.5
// when it covers half of it. Measured against the day, so a narrow outfit
// sitting inside a wide day only scores the part of the day it covers.
// A single-temperature day counts as fully covered if that temperature is
// inside the outfit's range, and not at all otherwise.
function todayCoverageFraction(outfitRange, todayRange) {
  const overlapStart = Math.max(outfitRange.min, todayRange.min);
  const overlapEnd = Math.min(outfitRange.max, todayRange.max);
  const todaySpan = todayRange.max - todayRange.min;

  if (todaySpan <= 0) {
    return outfitRange.min <= todayRange.min && todayRange.min <= outfitRange.max
      ? 1
      : 0;
  }

  const overlap = Math.max(0, overlapEnd - overlapStart);

  return overlap / todaySpan;
}

// Where an outfit's min_temp and max_temp must each sit to count as close
// to a day's (or the filter's) min and max: the minimum up to
// CLOSE_MATCH_MIN either side of min, the maximum up to CLOSE_MATCH_MAX
// either side of max. A null end has no bounds.
// { min: [low, high] | null, max: [low, high] | null }.
function closeMatchBounds({ min, max }) {
  return {
    min: min === null ? null : [min - CLOSE_MATCH_MIN, min + CLOSE_MATCH_MIN],
    max: max === null ? null : [max - CLOSE_MATCH_MAX, max + CLOSE_MATCH_MAX],
  };
}

module.exports = {
  temperatureOverlapFraction,
  todayCoverageFraction,
  closeMatchBounds,
};
