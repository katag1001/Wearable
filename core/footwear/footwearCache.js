import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { isDateToday } from "../utils/dates.js";

// Today's shoe box state, kept for the rest of the day like the outfit
// cache (../today/todayCache.js):
//  - order: the shoe order for the worn outfit, so it doesn't shuffle on
//    a refresh while the user is browsing
//    ({ matchId, bottomSubtype, footwearIds });
//  - worn: the shoe marked worn today, with the snapshot needed to undo it
//    if a different shoe or outfit is worn instead
//    ({ footwearId, matchId, bottomSubtype, snapshot }).

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
      return { order: null, worn: null };
    }

    return {
      order: cached.order ?? null,
      worn: cached.worn ?? null,
    };
  } catch {
    return { order: null, worn: null };
  }
};

export const cacheFootwear = ({ order, worn }) => {
  try {
    getStorage().setItem(
      STORAGE_KEYS.todayFootwear,
      JSON.stringify({
        date: new Date().toISOString(),
        user: getCurrentUser(),
        order: order ?? null,
        worn: worn ?? null,
      })
    );
  } catch (err) {
    console.error("Failed to cache today's footwear:", err);
  }
};
