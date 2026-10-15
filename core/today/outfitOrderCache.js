// core/today/outfitOrderCache.js
//
// Today's outfits are sorted once a day; the order (match ids) is kept so
// later loads show them in the same order instead of re-sorting.

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { isDateToday } from "../utils/dates.js";

// The match ids in today's order, or null if not sorted yet today.
export const getCachedOutfitOrder = () => {
  try {
    const cached = JSON.parse(
      getStorage().getItem(STORAGE_KEYS.todayOutfitOrder)
    );

    if (!cached || !isDateToday(cached.date) || !Array.isArray(cached.outfitIds)) {
      return null;
    }

    return cached.outfitIds;
  } catch {
    return null;
  }
};

export const cacheOutfitOrder = (sortedOutfits) => {
  try {
    const outfitIds = sortedOutfits
      .map((outfit) => outfit?.matchId?._id)
      .filter(Boolean);

    getStorage().setItem(
      STORAGE_KEYS.todayOutfitOrder,
      JSON.stringify({ date: new Date().toISOString(), outfitIds })
    );

    console.log("Cached today's outfit order:", outfitIds);
  } catch (err) {
    console.error("Failed to cache today's outfit order:", err);
  }
};
