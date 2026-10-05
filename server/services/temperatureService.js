// api/services/temperatureService.js
//
// Pure temperature-range computation for a finished outfit. Takes plain
// clothing-like objects ({ type, min_temp, max_temp }) already loaded by the
// caller - no DB access here.
//
// Full explanation with worked examples: context/temperature-ranges.md
//
// Tops are layers, so they combine rather than intersect: the tops' range
// runs from the coldest top's min_temp to the hottest top's max_temp (a
// layer can always come off, so layering never lowers the ceiling). That
// tops range is then intersected with the bottom/onepiece to get the base
// range.
//
// Item min_temps assume the item may be worn under other layers, so on its
// own the base floor is too optimistic. Without an outer, the floor is
// therefore raised to at least NO_OUTER_MIN_TEMP for the outfit's layer
// count (tops + onepiece) and the user's temperature preference. With an
// outer, the floor is replaced entirely by the coldest outer's own
// min_temp; a second outer pushes that floor 4 degrees colder. The ceiling
// is never touched by outers either.
//
// If raising the floor pushes it above the ceiling, the range collapses to
// a single point at the ceiling - the outfit is kept, never rejected.
//
// If the base items don't actually overlap: a user-made outfit falls back
// to the union of their ranges (never rejected). An auto-search candidate
// is rejected outright at this point (returns null) - there's no valid
// season for it, so no reason to run the pricier colour/pattern checks.

const EXTRA_OUTER_PENALTY = 4;
const MIN_TODAY_OVERLAP_FRACTION = 0.5;

// Lowest min_temp an outfit with no outer can have, by layer count
// (tops + onepiece) and the user's "too cold / too hot" preference.
// A missing/unknown preference is treated as "normal".
const NO_OUTER_MIN_TEMP = {
  1: { hot: 13, normal: 14, cold: 15 },
  2: { hot: 11, normal: 12, cold: 13 },
};

function getNoOuterMinTemp(layerCount, temperaturePreference) {
  const byPreference = NO_OUTER_MIN_TEMP[Math.min(Math.max(layerCount, 1), 2)];

  return byPreference[temperaturePreference] ?? byPreference.normal;
}

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

// Overlap of the combined tops range with every bottom/onepiece.
function baseRange(topItems, otherBaseItems) {
  const ranges = [...otherBaseItems];

  if (topItems.length) {
    const tops = unionRange(topItems);
    ranges.push({ min_temp: tops.min, max_temp: tops.max });
  }

  return overlapRange(ranges);
}

function computeTemperatureRange(items, { isUserMade, temperaturePreference = null }) {
  const outerItems = items.filter((item) => item.type === "outer");
  const topItems = items.filter((item) => item.type === "top");
  const otherBaseItems = items.filter(
    (item) => item.type !== "outer" && item.type !== "top"
  );

  let base = baseRange(topItems, otherBaseItems);

  if (base.min > base.max) {
    if (!isUserMade) {
      return null;
    }

    base = unionRange([...topItems, ...otherBaseItems]);
  }

  const max_temp = base.max;
  let min_temp;

  if (outerItems.length) {
    min_temp = Math.min(...outerItems.map((item) => item.min_temp));

    if (outerItems.length > 1) {
      min_temp -= EXTRA_OUTER_PENALTY;
    }
  } else {
    const layerCount = topItems.length +
      otherBaseItems.filter((item) => item.type === "onepiece").length;

    min_temp = Math.max(
      base.min,
      getNoOuterMinTemp(layerCount, temperaturePreference)
    );
  }

  // Never reject over this - collapse to a single point at the ceiling.
  if (min_temp > max_temp) {
    min_temp = max_temp;
  }

  return { min_temp, max_temp };
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
  getNoOuterMinTemp,
  NO_OUTER_MIN_TEMP,
  EXTRA_OUTER_PENALTY,
  MIN_TODAY_OVERLAP_FRACTION,
};
