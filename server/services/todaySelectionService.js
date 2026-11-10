// server/services/todaySelectionService.js
//
// Which outfits make today's list, in what order. Pure - no DB access.
// (Numbers: constants/todayOutfits.js.)
//
//  1. The weather decides who's in the running. Tier 1: outfits whose
//     min_temp and max_temp are each close to today's daytime min and max
//     (temperatureService.closeMatchBounds: the minimum within 2° and the
//     maximum within 1° either way), or whose range covers ALL of today's daytime
//     temperatures (FULL_COVERAGE). Then one tier per COVERAGE_STEPS value
//     (95%, 90% ... 50%): those covering at least that much of the day.
//     An outfit that takes tights (takesTights) is also checked against
//     its tights range (services/tightsService.js) and goes in whichever
//     tier is better - without tights on a tie. Whole tiers join, best
//     first, until at least TODAY_OUTFIT_LIMIT outfits are in the running.
//  2. A notice when few fit: "few" once the FEW_OUTFITS_COVERAGE step had
//     to join, "shopping" when even the last step leaves fewer than
//     TODAY_OUTFIT_LIMIT - with the day's weather band.
//  3. Everything in the running is ranked together, whatever its tier, by
//     todayRankingService with each outfit's Today score (`scoreOf` -
//     todayScoreService.js): every outfit with today's tag, then every
//     outfit without, each group in its own order. No random nudge yet, so
//     the score and freshness alone decide which TODAY_OUTFIT_LIMIT
//     outfits are kept.
//  4. Only then, within the kept outfits and each tag group: the random
//     nudge (jitter), then outfits sharing an item are spread out
//     (todayDiversityService).

const {
  TODAY_OUTFIT_LIMIT,
  FULL_COVERAGE,
  COVERAGE_STEPS,
  FEW_OUTFITS_COVERAGE,
  SHOPPING_COVERAGE,
  COLD_BELOW,
  HOT_ABOVE,
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

  const step = COVERAGE_STEPS.findIndex(
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

const TIER_COUNT = 1 + COVERAGE_STEPS.length;

// The coverage of a tier (tier 1 counts as full).
const coverageOfTier = (tier) => (tier === 0 ? FULL_COVERAGE : COVERAGE_STEPS[tier - 1]);

// "cold" / "mild" / "hot", from the average of today's min and max.
const weatherBandOf = ({ min, max }) => {
  const average = (min + max) / 2;

  if (average < COLD_BELOW) return "cold";
  if (average > HOT_ABOVE) return "hot";
  return "mild";
};

// The outfits in the running: whole tiers, best first, until there are at
// least `limit`. Returns { running, lowestCoverage } - the coverage of the
// last tier that joined.
const outfitsInTheRunning = (matches, todayRange, temperaturePreference, limit) => {
  const tiers = Array.from({ length: TIER_COUNT }, () => []);

  matches.forEach((match) => {
    const tier = todayTierOf(match, todayRange, temperaturePreference);

    if (tier !== null) {
      tiers[tier].push(match);
    }
  });

  const running = [];
  let lowestCoverage = FULL_COVERAGE;

  for (let tier = 0; tier < TIER_COUNT && running.length < limit; tier += 1) {
    running.push(...tiers[tier]);
    lowestCoverage = coverageOfTier(tier);
  }

  return { running, lowestCoverage };
};

// { level, band } when few outfits fit today's weather, else null.
const noticeFor = ({ running, lowestCoverage }, todayRange, limit) => {
  const reached = (coverage) => lowestCoverage <= coverage + EPSILON;
  let level = null;

  if (reached(SHOPPING_COVERAGE) && running.length < limit) {
    level = "shopping";
  } else if (reached(FEW_OUTFITS_COVERAGE)) {
    level = "few";
  }

  return level ? { level, band: weatherBandOf(todayRange) } : null;
};

// A random() that always nudges by 0 (todayDiversityService.jitter).
const NO_JITTER = () => 0.5;

// Today's list: { matches (best first, at most `limit`), notice }.
// `scoreOf(match)` is the outfit's Today score (todayScoreService.js; the
// saved score by default). `random` drives the ranking jitter (pass one in
// for tests).
const selectTodayMatches = ({
  matches,
  todayRange,
  todayTag = null,
  temperaturePreference = null,
  scoreOf,
  now = new Date(),
  limit = TODAY_OUTFIT_LIMIT,
  random = Math.random,
}) => {
  const inTheRunning = outfitsInTheRunning(matches, todayRange, temperaturePreference, limit);

  return {
    matches: rankForToday({ matches: inTheRunning.running, todayTag, scoreOf, now, limit, random }),
    notice: noticeFor(inTheRunning, todayRange, limit),
  };
};

// Steps 3 and 4 alone: `matches` in today's order, at most `limit` (all
// of them by default). Also re-orders a list already built for another tag
// (services/todayTagService.js).
const rankForToday = ({
  matches,
  todayTag = null,
  scoreOf,
  now = new Date(),
  limit = matches.length,
  random = Math.random,
}) => {
  // The best `limit`, tagged first - no nudge, so it can't change who's in.
  const [tagged, untagged] = rankTodayGroups(matches, todayTag, now, NO_JITTER, scoreOf);
  const keptTagged = tagged.slice(0, limit);
  const kept = [keptTagged, untagged.slice(0, limit - keptTagged.length)];

  // Then the nudge and the spreading, each tag group on its own.
  const ranked = [];

  for (const group of kept) {
    const [nudged] = rankTodayGroups(group, null, now, random, scoreOf);

    ranked.push(...spreadSharedItems(nudged, ranked));
  }

  return ranked;
};

module.exports = {
  selectTodayMatches,
  rankForToday,
  weatherBandOf,
  todayTierOf,
  todayFitOf,
};
