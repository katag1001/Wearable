// api/services/outfitEvaluator.js
//
// Orchestrates matrixService/temperatureService/styleColorService into the
// two outfit-level operations everything else calls:
//
//  - describeOutfit: ALWAYS runs, and NEVER rejects a user-made outfit. It
//    computes the descriptive fields (temperature, role counts, tags,
//    combined colours/styles) for any finished item-set - auto-generated or
//    manually built by the user. For an auto-search candidate only, it can
//    return null if the base items share no usable temperature range at
//    all, so the pricier checks in validateOutfit never run on it.
//
//  - validateOutfit: the gate used ONLY for auto-generated candidates -
//    matrix compatibility (including layering rules) + colour + pattern.
//    Never called for a user-made outfit. matchService's search already
//    prunes on all of this incrementally as it builds a candidate, so by
//    the time a candidate reaches here it should always pass - this call
//    stays in as a cheap final safety net, not the primary filter.
//
// No DB access here except the (optional) tag computation, which is pure
// given already-loaded items.

const { computeTemperatureRange } = require("./temperatureService.js");
const { passesPatternCheck, passesColorCheck } = require("./styleColorService.js");
const { isCliqueValid } = require("./matrixService.js");
const { computeMatchTags } = require("./helpers.js");

const ROLE_TYPE_TO_COUNT_FIELD = {
  top: "topCount",
  bottom: "bottomCount",
  onepiece: "onepieceCount",
  outer: "outerCount",
};

function countRoles(items) {
  const counts = {
    topCount: 0,
    bottomCount: 0,
    onepieceCount: 0,
    outerCount: 0,
  };

  items.forEach((item) => {
    const field = ROLE_TYPE_TO_COUNT_FIELD[item.type];

    if (field) {
      counts[field] += 1;
    }
  });

  return counts;
}

const SEASONS = ["spring", "summer", "autumn", "winter"];

function computeSeasons(items) {
  const seasons = {};

  SEASONS.forEach((season) => {
    seasons[season] = items.every((item) => item[season]);
  });

  return seasons;
}

// True if there's at least one season every item shares. Monotonic - once
// false for a partial item-set, adding more items can never make it true
// again - so this is safe to check early/incrementally during a search, not
// just on a finished item-set.
function hasSharedSeason(items) {
  return SEASONS.some((season) => items.every((item) => item[season]));
}

function describeOutfit(items, { isUserMade }) {
  const temperature = computeTemperatureRange(items, { isUserMade });

  if (!temperature) {
    return null;
  }

  const seasons = computeSeasons(items);

  if (!hasSharedSeason(items) && !isUserMade) {
    return null;
  }

  const roleCounts = countRoles(items);

  const colors = [...new Set(items.flatMap((item) => item.colors || []))];
  const styles = [...new Set(items.flatMap((item) => item.styles || []))];
  const tags = computeMatchTags(items);

  return {
    clothes: items.map((item) => item._id),
    type: "match",
    colors,
    styles,
    tags,
    min_temp: Number(temperature.min_temp.toFixed(1)),
    max_temp: Number(temperature.max_temp.toFixed(1)),
    ...seasons,
    ...roleCounts,
    hasOuter: roleCounts.outerCount > 0,
  };
}

function validateOutfit(items, baselineMatrix, personalScores, requiresLayeringSet) {
  if (!isCliqueValid(items, baselineMatrix, personalScores, requiresLayeringSet)) {
    return false;
  }

  if (!passesPatternCheck(items)) {
    return false;
  }

  if (!passesColorCheck(items)) {
    return false;
  }

  return true;
}

module.exports = { describeOutfit, validateOutfit, countRoles, hasSharedSeason };
