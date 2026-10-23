// server/constants/todayOutfits.js
//
// Every number behind today's outfit list (/today/create): which outfits
// get in, how they're ordered, and how many are kept. The rules are in
// services/todaySelectionService.js and services/todayRankingService.js;
// see context/clothing-and-matching-flow.md ("Today's outfits").

// The most outfits kept for a day.
const TODAY_OUTFIT_LIMIT = 200;

// Weather tiers. Each outfit goes in the first tier it fits, and a tier
// only joins while the ones above it have fewer than TODAY_OUTFIT_LIMIT -
// always ranked below them:
//  - tier 1: the outfit's min_temp and max_temp are each close to today's
//    daytime min and max - up to CLOSE_MATCH_OUTSIDE degrees beyond the
//    day's range, or CLOSE_MATCH_INSIDE degrees inside it (a 10-20 day
//    takes minimums of 8.5-12 and maximums of 18-22) - OR its range covers
//    the whole day (temperatureService.todayCoverageFraction =
//    FULL_COVERAGE) - both ranked together;
//  - then one tier per PARTIAL_COVERAGE_STEPS value, highest first: it
//    covers at least that much of the day.
// The Matches page temperature filter uses the same closeness rule.
const CLOSE_MATCH_OUTSIDE = 1.5;
const CLOSE_MATCH_INSIDE = 2;
const FULL_COVERAGE = 1;
const PARTIAL_COVERAGE_STEPS = [0.9, 0.8, 0.7];

// Within a tier, outfits with today's tag (from the weekly preferences)
// come first, then the rest. Each group is ordered by this weighted score
// (all parts on a 0-10 scale).
const RANKING_WEIGHTS = {
  clothingFreshness: 0.1,
  outfitFreshness: 0.2,
  score: 0.7,
};

// Variety (services/todayDiversityService.js). Each ranking score gets a
// random nudge of up to +/- RANKING_JITTER (on the 0-10 scale) so the order
// varies day to day. Then, within each tag group of each tier, the next
// outfit is the best one sharing no clothing item with the last
// SPREAD_LOOKBACK outfits placed - or, if every one does, the one sharing
// the fewest.
const RANKING_JITTER = 0.3;
const SPREAD_LOOKBACK = 3;

// Freshness: 0 when worn today, rising to the maximum after this many days
// (and the maximum for never worn).
const FRESHNESS_FULL_DAYS = 30;
const MAX_FRESHNESS = 10;

module.exports = {
  TODAY_OUTFIT_LIMIT,
  CLOSE_MATCH_OUTSIDE,
  CLOSE_MATCH_INSIDE,
  FULL_COVERAGE,
  PARTIAL_COVERAGE_STEPS,
  RANKING_WEIGHTS,
  RANKING_JITTER,
  SPREAD_LOOKBACK,
  FRESHNESS_FULL_DAYS,
  MAX_FRESHNESS,
};
