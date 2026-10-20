// server/services/todaySelectionService.js
//
// Which outfits make today's list, in what order. Pure - no DB access.
//
//  1. Tier 1: outfits whose min_temp and max_temp are each within
//     CLOSE_MATCH_TOLERANCE of today's daytime min and max, or whose range
//     covers ALL of today's daytime temperatures (FULL_COVERAGE).
//  2. Then one tier per PARTIAL_COVERAGE_STEPS value (90%, 80%, 70%):
//     those covering at least that much of the day.
//  Each outfit goes in the first tier it fits. A tier only joins while the
//  tiers above it have fewer than TODAY_OUTFIT_LIMIT outfits, and always
//  sits below them.
//  3. Each tier ordered by todayRankingService (tagged outfits first),
//     then each tag group spread out so outfits sharing an item aren't
//     next to each other (todayDiversityService). The list stops at
//     TODAY_OUTFIT_LIMIT.

const {
  TODAY_OUTFIT_LIMIT,
  CLOSE_MATCH_TOLERANCE,
  FULL_COVERAGE,
  PARTIAL_COVERAGE_STEPS,
} = require("../constants/todayOutfits.js");
const { todayCoverageFraction } = require("./temperatureService.js");
const { rankTodayGroups } = require("./todayRankingService.js");
const { spreadSharedItems } = require("./todayDiversityService.js");

// Allows for floating-point rounding in the comparisons.
const EPSILON = 1e-9;

const isCloseMatch = (match, todayRange) =>
  Math.abs(match.min_temp - todayRange.min) <= CLOSE_MATCH_TOLERANCE + EPSILON &&
  Math.abs(match.max_temp - todayRange.max) <= CLOSE_MATCH_TOLERANCE + EPSILON;

const coverageOf = (match, todayRange) =>
  todayCoverageFraction({ min: match.min_temp, max: match.max_temp }, todayRange);

// The weather tier an outfit belongs to today (0 is the best), or null if
// it doesn't qualify at all.
const todayTierOf = (match, todayRange) => {
  const coverage = coverageOf(match, todayRange);

  if (isCloseMatch(match, todayRange) || coverage >= FULL_COVERAGE - EPSILON) {
    return 0;
  }

  const step = PARTIAL_COVERAGE_STEPS.findIndex(
    (minimum) => coverage >= minimum - EPSILON
  );

  return step === -1 ? null : step + 1;
};

const TIER_COUNT = 1 + PARTIAL_COVERAGE_STEPS.length;

// The matches for today's list, best first, at most `limit`. `random`
// drives the ranking jitter (pass one in for tests).
const selectTodayMatches = ({
  matches,
  todayRange,
  todayTag = null,
  now = new Date(),
  limit = TODAY_OUTFIT_LIMIT,
  random = Math.random,
}) => {
  const tiers = Array.from({ length: TIER_COUNT }, () => []);

  matches.forEach((match) => {
    const tier = todayTierOf(match, todayRange);

    if (tier !== null) {
      tiers[tier].push(match);
    }
  });

  const ranked = [];

  for (const tier of tiers) {
    for (const group of rankTodayGroups(tier, todayTag, now, random)) {
      if (ranked.length >= limit) {
        return ranked;
      }

      ranked.push(...spreadSharedItems(group, ranked, limit - ranked.length));
    }
  }

  return ranked;
};

module.exports = {
  selectTodayMatches,
  todayTierOf,
};
