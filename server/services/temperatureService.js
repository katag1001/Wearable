// api/services/temperatureService.js
//
// Pure temperature-range computation for a finished outfit. Takes plain
// clothing-like objects ({ type, min_temp, max_temp }) already loaded by the
// caller - no DB access here.
//
// Base range = overlap of every non-outer item (top(s)/bottom/onepiece).
// A second top makes the outfit wearable 2 degrees colder. Outers replace
// the floor entirely (rather than intersecting with it) with the coldest
// outer's own min_temp; a second outer pushes that floor 4 degrees colder.
// The ceiling (max_temp) is never touched by layering - only the floor
// drops as layers are added.
//
// If the base items don't actually overlap: a user-made outfit falls back
// to the union of their ranges (never rejected). An auto-search candidate
// is rejected outright at this point (returns null) - there's no valid
// season for it, so no reason to run the pricier colour/pattern checks.

const EXTRA_TOP_PENALTY = 2;
const EXTRA_OUTER_PENALTY = 4;
const MIN_TODAY_OVERLAP_FRACTION = 0.5;

function overlapRange(items) {
  return {
    min: Math.max(...items.map((item) => item.min_temp)),
    max: Math.min(...items.map((item) => item.max_temp)),
  };
}

function unionRange(items) {
  return {
    min: Math.min(...items.map((item) => item.min_temp)),
    max: Math.max(...items.map((item) => item.max_temp)),
  };
}

function computeTemperatureRange(items, { isUserMade }) {
  const outerItems = items.filter((item) => item.type === "outer");
  const baseItems = items.filter((item) => item.type !== "outer");

  let base = overlapRange(baseItems);

  if (base.min > base.max) {
    if (!isUserMade) {
      return null;
    }

    base = unionRange(baseItems);
  }

  const topCount = items.filter((item) => item.type === "top").length;

  let min_temp = base.min;
  const max_temp = base.max;

  if (topCount > 1) {
    min_temp -= EXTRA_TOP_PENALTY;
  }

  if (!outerItems.length) {
    return { min_temp, max_temp };
  }

  let outerFloor = Math.min(...outerItems.map((item) => item.min_temp));

  if (outerItems.length > 1) {
    outerFloor -= EXTRA_OUTER_PENALTY;
  }

  return { min_temp: outerFloor, max_temp };
}

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
  computeTemperatureRange,
  temperatureOverlapFraction,
  matchesTodayTemperature,
  EXTRA_TOP_PENALTY,
  EXTRA_OUTER_PENALTY,
  MIN_TODAY_OVERLAP_FRACTION,
};
