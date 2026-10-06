// server/services/temperatureService.js
//
// Matching an outfit's temperature range against today's weather. Pure -
// no DB access here.
//
// A match's own range is worked out from its subtypes when the match is
// created - see presetTemperatureService.js and
// context/temperature-ranges.md. Clothing items have no range of their own.

const MIN_TODAY_OVERLAP_FRACTION = 0.5;

// How much of the outfit's own temperature span falls inside today's range.
// Scales the tolerance with the outfit's width instead of a flat degree
// band, so a wide-range outfit isn't held to the same slack as a narrow one.
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

function matchesTodayTemperature(
  outfitRange,
  todayRange,
  minOverlapFraction = MIN_TODAY_OVERLAP_FRACTION
) {
  return temperatureOverlapFraction(outfitRange, todayRange) >= minOverlapFraction;
}

module.exports = {
  temperatureOverlapFraction,
  matchesTodayTemperature,
  MIN_TODAY_OVERLAP_FRACTION,
};
