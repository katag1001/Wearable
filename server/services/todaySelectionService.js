// server/services/todaySelectionService.js
//
// Which outfits make today's list, in what order. Pure - no DB access.
//
//  1. Tier 1: outfits whose range covers ALL of today's daytime
//     temperatures (FULL_COVERAGE).
//  2. Only if tier 1 has fewer than TODAY_OUTFIT_LIMIT outfits: tier 2,
//     those covering at least PARTIAL_COVERAGE of the day - always below
//     every tier 1 outfit.
//  3. Each tier ordered by todayRankingService, then the list is cut to
//     TODAY_OUTFIT_LIMIT.

const {
  TODAY_OUTFIT_LIMIT,
  FULL_COVERAGE,
  PARTIAL_COVERAGE,
} = require("../constants/todayOutfits.js");
const { todayCoverageFraction } = require("./temperatureService.js");
const { rankTodayMatches } = require("./todayRankingService.js");

// Allows for floating-point rounding in the coverage fraction.
const EPSILON = 1e-9;

const coverageOf = (match, todayRange) =>
  todayCoverageFraction({ min: match.min_temp, max: match.max_temp }, todayRange);

// The matches for today's list, best first, at most `limit`.
const selectTodayMatches = ({
  matches,
  todayRange,
  todayTag = null,
  now = new Date(),
  limit = TODAY_OUTFIT_LIMIT,
}) => {
  const withCoverage = matches.map((match) => ({
    match,
    coverage: coverageOf(match, todayRange),
  }));

  const fullTier = withCoverage
    .filter((entry) => entry.coverage >= FULL_COVERAGE - EPSILON)
    .map((entry) => entry.match);

  const ranked = rankTodayMatches(fullTier, todayTag, now);

  if (ranked.length < limit) {
    const partialTier = withCoverage
      .filter(
        (entry) =>
          entry.coverage < FULL_COVERAGE - EPSILON &&
          entry.coverage >= PARTIAL_COVERAGE - EPSILON
      )
      .map((entry) => entry.match);

    ranked.push(...rankTodayMatches(partialTier, todayTag, now));
  }

  return ranked.slice(0, limit);
};

module.exports = {
  selectTodayMatches,
};
