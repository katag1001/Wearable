// server/services/temperatureService.js
//
// Matching an outfit's temperature range against today's weather. Pure -
// no DB access here.
//
// A match's own range is worked out from its subtypes when the match is
// created - see presetTemperatureService.js and
// context/temperature-ranges.md. Clothing items have no range of their own.

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

module.exports = {
  temperatureOverlapFraction,
  todayCoverageFraction,
};
