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
//  - tier 1: the outfit's min_temp and max_temp are each within
//    CLOSE_MATCH_TOLERANCE degrees of today's daytime min and max, OR its
//    range covers the whole day
//    (temperatureService.todayCoverageFraction = FULL_COVERAGE) - both
//    ranked together;
//  - then one tier per PARTIAL_COVERAGE_STEPS value, highest first: it
//    covers at least that much of the day.
const CLOSE_MATCH_TOLERANCE = 1.5;
const FULL_COVERAGE = 1;
const PARTIAL_COVERAGE_STEPS = [0.9, 0.8, 0.7];

// Within a tier, outfits with today's tag (from the weekly preferences)
// come first, then the rest. Each group is ordered by this weighted score
// (all parts on a 0-10 scale).
const RANKING_WEIGHTS = {
  clothingFreshness: 0.2,
  outfitFreshness: 0.2,
  score: 0.6,
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

// A favourite counts as this score (out of 100), like everywhere else.
const FAVOURITE_SCORE = 100;

module.exports = {
  TODAY_OUTFIT_LIMIT,
  CLOSE_MATCH_TOLERANCE,
  FULL_COVERAGE,
  PARTIAL_COVERAGE_STEPS,
  RANKING_WEIGHTS,
  RANKING_JITTER,
  SPREAD_LOOKBACK,
  FRESHNESS_FULL_DAYS,
  MAX_FRESHNESS,
  FAVOURITE_SCORE,
};
