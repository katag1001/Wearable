import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { isDateToday } from "../utils/dates.js";

// Today's shoe state, kept for the rest of the day like the outfit cache
// (../today/todayCache.js):
//  - orders: each outfit's shoe order, so it doesn't shuffle on a refresh
//    while the user is browsing
//    ({ [matchId]: { bottomSubtype, rankedFor, footwearIds } });
//  - chosen: the shoe the user picked for an outfit with Change shoes
//    ({ [matchId]: footwearId });
//  - worn: the shoe marked worn today, with the snapshot needed to undo it
//    if a different shoe or outfit is worn instead
//    ({ footwearId, matchId, bottomSubtype, snapshot }).

const EMPTY = { orders: {}, chosen: {}, worn: null };

const getCurrentUser = () => getStorage().getItem(STORAGE_KEYS.user);

export const getCachedFootwear = () => {
  try {
    const cached = JSON.parse(
      getStorage().getItem(STORAGE_KEYS.todayFootwear)
    );

    if (
      !cached ||
      !isDateToday(cached.date) ||
      cached.user !== getCurrentUser()
    ) {
      return EMPTY;
    }

    return {
      orders: cached.orders ?? {},
      chosen: cached.chosen ?? {},
      worn: cached.worn ?? null,
    };
  } catch {
    return EMPTY;
  }
};

export const cacheFootwear = ({ orders, chosen, worn }) => {
  try {
    getStorage().setItem(
      STORAGE_KEYS.todayFootwear,
      JSON.stringify({
        date: new Date().toISOString(),
        user: getCurrentUser(),
        orders: orders ?? {},
        chosen: chosen ?? {},
        worn: worn ?? null,
      })
    );
  } catch (err) {
    console.error("Failed to cache today's footwear:", err);
  }
};
