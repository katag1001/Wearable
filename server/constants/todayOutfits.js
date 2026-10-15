// server/constants/todayOutfits.js
//
// Every number behind today's outfit list (/today/create): which outfits
// get in, how they're ordered, and how many are kept. The rules are in
// services/todaySelectionService.js and services/todayRankingService.js;
// see context/clothing-and-matching-flow.md ("Today's outfits").

// The most outfits kept for a day.
const TODAY_OUTFIT_LIMIT = 200;

// Weather tiers, by how much of today's daytime temperature range the
// outfit's range covers (temperatureService.todayCoverageFraction):
//  - tier 1: the whole day;
//  - tier 2 (only while tier 1 has fewer than TODAY_OUTFIT_LIMIT): at
//    least this much of it - always ranked below every tier 1 outfit.
const FULL_COVERAGE = 1;
const PARTIAL_COVERAGE = 0.7;

// Within a tier, outfits with today's tag (from the weekly preferences)
// come first, then the rest. Each group is ordered by this weighted score
// (all parts on a 0-10 scale).
const RANKING_WEIGHTS = {
  clothingFreshness: 0.35,
  outfitFreshness: 0.35,
  score: 0.3,
};

// Freshness: 0 when worn today, rising to the maximum after this many days
// (and the maximum for never worn).
const FRESHNESS_FULL_DAYS = 30;
const MAX_FRESHNESS = 10;

// A favourite counts as this score (out of 100), like everywhere else.
const FAVOURITE_SCORE = 100;

module.exports = {
  TODAY_OUTFIT_LIMIT,
  FULL_COVERAGE,
  PARTIAL_COVERAGE,
  RANKING_WEIGHTS,
  FRESHNESS_FULL_DAYS,
  MAX_FRESHNESS,
  FAVOURITE_SCORE,
};
