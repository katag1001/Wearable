// server/services/outfitEvaluator.js
//
// Orchestrates matrixService/presetTemperatureService/styleColorService into
// the two outfit-level operations everything else calls:
//
//  - describeOutfit: ALWAYS runs, and NEVER rejects a user-made outfit. It
//    computes the descriptive fields (temperature, role counts, tags,
//    season flags, combined colours/patterns) for any finished item-set -
//    auto-generated or manually built by the user. The temperature range
//    comes from the outfit's subtypes alone, so it never causes a
//    rejection; nor do seasons (services/seasonalityService.js). For an
//    auto-search candidate only, it returns null if the items share no
//    tag. A user-made outfit with no shared tag is still described - it
//    just gets an empty tag list.
//
//  - validateOutfit: the gate used ONLY for auto-generated candidates -
//    fixed compatibility (including layering rules) + no mismatched pair
//    (mismatchRules.js) + pattern (at the user's pattern level) + colour.
//    Never called for a user-made outfit. matchService's search already
//    prunes on all of this incrementally as it builds a candidate, so by
//    the time a candidate reaches here it should always pass - this call
//    stays in as a cheap final safety net, not the primary filter.
//
// No DB access here except the (optional) tag computation, which is pure
// given already-loaded items.

const { computePresetTemperatureRange } = require("./presetTemperatureService.js");
const { passesPatternCheck, passesColorCheck } = require("./styleColorService.js");
const { isCliqueValid } = require("./matrixService.js");
const { hasMismatchedPair } = require("./mismatchRules.js");
const { computeMatchTags } = require("./helpers.js");
const { canWearTights } = require("./tightsService.js");
const { PLAIN } = require("../constants/patternRules.js");
const { outfitSeasonFlags } = require("./seasonalityService.js");
const { getColorRules } = require("../utils/colorPalettes.js");

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

// `gender` picks the gender-specific tag requirements (constants/occasionTags.js);
// `colorRules` (the user's colour level, utils/colorPalettes.js) the palettes
// whose seasons count towards the season flags.
function describeOutfit(
  items,
  { isUserMade, temperaturePreference = null, gender = null, colorRules = getColorRules(null) }
) {
  const { min_temp, max_temp } = computePresetTemperatureRange(items, temperaturePreference);

  // An automatic outfit needs an occasion tag in common - after the tag
  // requirements, which can only be judged on the finished outfit.
  if (!isUserMade && computeMatchTags(items, gender).length === 0) {
    return null;
  }

  const roleCounts = countRoles(items);

  const colors = [...new Set(items.flatMap((item) => item.colors || []))];
  const seasons = outfitSeasonFlags({
    items,
    colours: colors,
    palettes: colorRules.palettes,
    range: { min_temp, max_temp },
  });
  // Every item's pattern (an item saved before pattern existed counts as Plain).
  const patterns = [...new Set(items.map((item) => item.pattern || PLAIN))];
  const tags = computeMatchTags(items, gender);

  return {
    clothes: items.map((item) => item._id),
    type: "match",
    colors,
    patterns,
    tags,
    min_temp,
    max_temp,
    tights: canWearTights(items),
    ...seasons,
    ...roleCounts,
    hasOuter: roleCounts.outerCount > 0,
  };
}

// `context` is the same { baselineMatrix, layeringRules, colorRules,
// patternLevel } object matchService builds once per run.
function validateOutfit(items, { baselineMatrix, layeringRules, colorRules, patternLevel }) {
  if (!isCliqueValid(items, baselineMatrix, layeringRules)) {
    return false;
  }

  if (hasMismatchedPair(items)) {
    return false;
  }

  if (!passesPatternCheck(items, patternLevel)) {
    return false;
  }

  if (!passesColorCheck(items, colorRules)) {
    return false;
  }

  return true;
}

module.exports = { describeOutfit, validateOutfit, countRoles };
