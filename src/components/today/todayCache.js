import { isDateToday } from "./todayHelpers";


// Today's outfits (already sorted) plus today's tag, kept for the rest of
// the day so a page refresh can show them straight away instead of
// flashing the loading messages while they're fetched again.
const TODAY_CACHE_KEY = "today_outfits_cache";


// The logged-in user's email - stops one user seeing another's cached day.
const getCurrentUser = () => {
  return localStorage.getItem("user");
};


/* -------------------------
   READ
------------------------- */

// { todayTag, outfits } saved earlier today by this user, or null.
export const getCachedToday = () => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(TODAY_CACHE_KEY)
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
    };

  } catch {
    return null;
  }
};


/* -------------------------
   WRITE
------------------------- */

export const cacheToday = ({ todayTag, outfits }) => {
  try {
    localStorage.setItem(
      TODAY_CACHE_KEY,
      JSON.stringify({
        date: new Date().toISOString(),
        user: getCurrentUser(),
        todayTag,
        outfits,
      })
    );

  } catch (err) {
    console.error("Failed to cache today's outfits:", err);
  }
};
