import { isDateToday } from "../todayHelpers";

// Today's shoe box state, kept for the rest of the day like the outfit
// cache (../todayCache.js):
//  - order: the shoe order for the worn outfit, so it doesn't shuffle on
//    a refresh while the user is browsing
//    ({ matchId, bottomSubtype, footwearIds });
//  - worn: the shoe marked worn today, with the snapshot needed to undo it
//    if a different shoe or outfit is worn instead
//    ({ footwearId, matchId, bottomSubtype, snapshot }).
const FOOTWEAR_CACHE_KEY = "today_footwear_cache";

const getCurrentUser = () => localStorage.getItem("user");

export const getCachedFootwear = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(FOOTWEAR_CACHE_KEY));

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
    localStorage.setItem(
      FOOTWEAR_CACHE_KEY,
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
