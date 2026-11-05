// server/constants/todayOutfits.js
//
// Every number behind today's outfit list (/today/create): which outfits
// get in, how they're ordered, and how many are kept. The rules are in
// services/todaySelectionService.js and services/todayRankingService.js;
// see context/clothing-and-matching-flow.md ("Today's outfits").

// The most outfits kept for a day.
const TODAY_OUTFIT_LIMIT = 150;

// Today's tag when the user hasn't set one for the day in their weekly
// preferences, or has one that's no longer a tag. The app uses the same
// one (core/today/todayInfo.js).
const DEFAULT_TODAY_TAG = "Elevated everyday";

// Picking another tag for the day on the Today tab (/today/tag): with at
// least this many outfits in today's list carrying the tag, the list is
// just re-ordered for it; with fewer, it's built again for that tag
// (services/todayTagService.js).
const TAG_SWITCH_MIN_OUTFITS = 10;

// Weather tiers - they decide which outfits are in the running, not their
// order. Each outfit goes in the first tier it fits:
//  - tier 1: the outfit's min_temp and max_temp are each close to today's
//    daytime min and max - up to CLOSE_MATCH_OUTSIDE degrees beyond the
//    day's range, or CLOSE_MATCH_INSIDE degrees inside it (a 10-20 day
//    takes minimums of 8.5-12 and maximums of 18-22) - OR its range covers
//    the whole day (temperatureService.todayCoverageFraction =
//    FULL_COVERAGE);
//  - then one tier per COVERAGE_STEPS value, highest first: it covers at
//    least that much of the day.
// Whole tiers join, best first, until at least TODAY_OUTFIT_LIMIT outfits
// are in the running; everything in the running is then ranked together.
// The Matches page temperature filter uses the same closeness rule.
const CLOSE_MATCH_OUTSIDE = 1.5;
const CLOSE_MATCH_INSIDE = 2;
const FULL_COVERAGE = 1;
const COVERAGE_STEPS = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5];

// Today's notice (shared/todayMessages.json): "few" once the 70% step had
// to join; "shopping" when even the 50% step leaves fewer than
// TODAY_OUTFIT_LIMIT. The message suits the day's weather band (the
// average of today's min and max): below COLD_BELOW is cold, above
// HOT_ABOVE is hot, otherwise mild.
const FEW_OUTFITS_COVERAGE = 0.7;
const SHOPPING_COVERAGE = 0.5;
const COLD_BELOW = 10;
const HOT_ABOVE = 20;

// Points added on Today only (services/todayScoreService.js) - never to
// the saved score: an outfit with a favourite item, and one whose colours
// fit a favourite palette (Preferences.favouritePalettes). Seasonal points
// are in constants/seasonality.js.
const FAVOURITE_ITEM_BONUS = 7;
const FAVOURITE_PALETTE_BONUS = 4;

// Outfits with today's tag (from the weekly preferences) come first, then
// the rest. Each group is ordered by this weighted score (all parts on a
// 0-10 scale; `score` is the Today score - saved score plus Today's
// points).
const RANKING_WEIGHTS = {
  clothingFreshness: 0.1,
  outfitFreshness: 0.2,
  score: 0.7,
};

// Variety (services/todayDiversityService.js), once the TODAY_OUTFIT_LIMIT
// outfits are chosen - it never changes which ones. Each ranking score gets
// a random nudge of up to +/- RANKING_JITTER (on the 0-10 scale) so the
// order varies day to day. Then, within each tag group, the next outfit is
// the best one sharing no clothing item with the last SPREAD_LOOKBACK
// outfits placed - or, if every one does, the one sharing the fewest.
const RANKING_JITTER = 0.3;
const SPREAD_LOOKBACK = 3;

// Freshness: 0 when worn today, rising to the maximum after this many days
// (and the maximum for never worn).
const FRESHNESS_FULL_DAYS = 30;
const MAX_FRESHNESS = 10;

module.exports = {
  TODAY_OUTFIT_LIMIT,
  DEFAULT_TODAY_TAG,
  TAG_SWITCH_MIN_OUTFITS,
  CLOSE_MATCH_OUTSIDE,
  CLOSE_MATCH_INSIDE,
  FULL_COVERAGE,
  COVERAGE_STEPS,
  FEW_OUTFITS_COVERAGE,
  SHOPPING_COVERAGE,
  COLD_BELOW,
  HOT_ABOVE,
  FAVOURITE_ITEM_BONUS,
  FAVOURITE_PALETTE_BONUS,
  RANKING_WEIGHTS,
  RANKING_JITTER,
  SPREAD_LOOKBACK,
  FRESHNESS_FULL_DAYS,
  MAX_FRESHNESS,
};
