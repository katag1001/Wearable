// server/services/todayDiversityService.js
//
// Variety in today's list, so outfits sharing an item don't sit next to
// each other. Pure - no DB access (`random` can be passed in for tests).
// Numbers in constants/todayOutfits.js.
//
//  - jitter: a random nudge added to each ranking score
//    (todayRankingService.js), so the order varies day to day.
//  - spreadSharedItems: reorders an already-ranked group. The next outfit
//    is the highest-ranked one sharing no clothing item with the last
//    SPREAD_LOOKBACK outfits placed; if every remaining one shares
//    something, the one sharing the fewest (highest-ranked on a tie).

const { RANKING_JITTER, SPREAD_LOOKBACK } = require("../constants/todayOutfits.js");

// A random amount between -RANKING_JITTER and +RANKING_JITTER.
const jitter = (random = Math.random) => (random() * 2 - 1) * RANKING_JITTER;

// The outfit's clothing item ids, whether clothes are populated or not.
const itemIdsOf = (match) =>
  (match.clothes || []).filter(Boolean).map((item) => String(item._id ?? item));

// `ranked` reordered for variety, at most `count` of it. `placed` is what's
// already above it in the list (earlier tiers and tag groups), so the first
// outfits here also avoid the items just before them.
const spreadSharedItems = (ranked, placed = [], count = ranked.length) => {
  const itemIds = new Map();
  const idsOf = (match) => {
    if (!itemIds.has(match)) {
      itemIds.set(match, itemIdsOf(match));
    }
    return itemIds.get(match);
  };

  const remaining = [...ranked];
  const result = [];

  while (result.length < count && remaining.length) {
    const recentIds = new Set(
      [...placed, ...result].slice(-SPREAD_LOOKBACK).flatMap(idsOf)
    );

    let bestIndex = 0;
    let bestShared = Infinity;

    for (let index = 0; index < remaining.length; index += 1) {
      const shared = idsOf(remaining[index]).filter((id) => recentIds.has(id)).length;

      if (shared < bestShared) {
        bestIndex = index;
        bestShared = shared;
      }

      if (shared === 0) {
        break;
      }
    }

    result.push(...remaining.splice(bestIndex, 1));
  }

  return result;
};

module.exports = {
  jitter,
  spreadSharedItems,
};
