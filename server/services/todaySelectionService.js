// server/services/todaySelectionService.js
//
// Which outfits make today's list, in what order. Pure - no DB access.
//
//  1. Tier 1: outfits whose min_temp and max_temp are each
//     close to today's daytime min and max (temperatureService.
//     closeMatchBounds: 1.5° beyond the day or 2° inside it), or whose range
//     covers ALL of today's daytime temperatures (FULL_COVERAGE).
//  2. Then one tier per PARTIAL_COVERAGE_STEPS value (90%, 80%, 70%):
//     those covering at least that much of the day.
//  An outfit that takes tights (takesTights) is also checked against
//  its tights range (services/tightsService.js) and goes in whichever tier
//  is better - without tights on a tie.
//  Each outfit goes in the first tier it fits. A tier only joins while the
//  tiers above it have fewer than TODAY_OUTFIT_LIMIT outfits, and always
//  sits below them.
//  3. Each tier ordered by todayRankingService (tagged outfits first),
//     then each tag group spread out so outfits sharing an item aren't
//     next to each other (todayDiversityService). The list stops at
//     TODAY_OUTFIT_LIMIT.

const {
  TODAY_OUTFIT_LIMIT,
  FULL_COVERAGE,
  PARTIAL_COVERAGE_STEPS,
} = require("../constants/todayOutfits.js");
const { todayCoverageFraction, closeMatchBounds } = require("./temperatureService.js");
const { rankTodayGroups } = require("./todayRankingService.js");
const { spreadSharedItems } = require("./todayDiversityService.js");
const { takesTights, tightsRange, savedMinTempFloor } = require("./tightsService.js");

// Allows for floating-point rounding in the comparisons.
const EPSILON = 1e-9;

const within = (value, [low, high]) => value >= low - EPSILON && value <= high + EPSILON;

const isCloseMatch = (range, todayRange) => {
  const bounds = closeMatchBounds(todayRange);
  return within(range.min, bounds.min) && within(range.max, bounds.max);
};

// The weather tier for one { min, max } range (0 is the best), or null.
const tierOfRange = (range, todayRange) => {
  const coverage = todayCoverageFraction(range, todayRange);

  if (isCloseMatch(range, todayRange) || coverage >= FULL_COVERAGE - EPSILON) {
    return 0;
  }

  const step = PARTIAL_COVERAGE_STEPS.findIndex(
    (minimum) => coverage >= minimum - EPSILON
  );

  return step === -1 ? null : step + 1;
};

// { tier, withTights } for an outfit today, or null if it doesn't qualify
// at all. An outfit that takes tights (takesTights) is also checked against its
// tights range - kept above the outfit's floors, so the match's clothes need
// `type` and `subtype`, and the user's temperature preference is needed
// to line the floors up with the saved range; withTights is true only when
// that range does better.
const todayFitOf = (match, todayRange, temperaturePreference = null) => {
  const range = { min: match.min_temp, max: match.max_temp };
  const tier = tierOfRange(range, todayRange);
  const tightsTier = takesTights(match)
    ? tierOfRange(
        tightsRange(range, savedMinTempFloor(match.clothes, temperaturePreference)),
        todayRange
      )
    : null;

  if (tightsTier !== null && (tier === null || tightsTier < tier)) {
    return { tier: tightsTier, withTights: true };
  }

  return tier === null ? null : { tier, withTights: false };
};

// The weather tier an outfit belongs to today (0 is the best), or null if
// it doesn't qualify at all.
const todayTierOf = (match, todayRange, temperaturePreference = null) =>
  todayFitOf(match, todayRange, temperaturePreference)?.tier ?? null;

const TIER_COUNT = 1 + PARTIAL_COVERAGE_STEPS.length;

// The matches for today's list, best first, at most `limit`. `random`
// drives the ranking jitter (pass one in for tests).
const selectTodayMatches = ({
  matches,
  todayRange,
  todayTag = null,
  temperaturePreference = null,
  now = new Date(),
  limit = TODAY_OUTFIT_LIMIT,
  random = Math.random,
}) => {
  const tiers = Array.from({ length: TIER_COUNT }, () => []);

  matches.forEach((match) => {
    const tier = todayTierOf(match, todayRange, temperaturePreference);

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
  todayFitOf,
};
