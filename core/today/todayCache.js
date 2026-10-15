import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { isDateToday } from "../utils/dates.js";


// Today's outfits (already sorted) plus today's tag, kept for the rest of
// the day so a page refresh can show them straight away instead of
// flashing the loading messages while they're fetched again.


// The logged-in user's email - stops one user seeing another's cached day.
const getCurrentUser = () => {
  return getStorage().getItem(STORAGE_KEYS.user);
};


/* -------------------------
   READ
------------------------- */

// { todayTag, outfits, wornToday } saved earlier today by this user, or null.
export const getCachedToday = () => {
  try {
    const cached = JSON.parse(
      getStorage().getItem(STORAGE_KEYS.todayOutfits)
    );

    if (
      !cached ||
      !isDateToday(cached.date) ||
      cached.user !== getCurrentUser() ||
      !Array.isArray(cached.outfits)
    ) {
      return null;
    }

    return {
      todayTag: cached.todayTag ?? null,
      outfits: cached.outfits,
      wornToday: cached.wornToday ?? null,
    };

  } catch {
    return null;
  }
};


/* -------------------------
   WRITE
------------------------- */

export const cacheToday = ({ todayTag, outfits, wornToday }) => {
  try {
    getStorage().setItem(
      STORAGE_KEYS.todayOutfits,
      JSON.stringify({
        date: new Date().toISOString(),
        user: getCurrentUser(),
        todayTag,
        outfits,
        wornToday: wornToday ?? null,
      })
    );

  } catch (err) {
    console.error("Failed to cache today's outfits:", err);
  }
};
