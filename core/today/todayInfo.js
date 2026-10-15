// core/today/todayInfo.js

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { getPreferences } from "../api/preferences.js";
import { getTodayDayOfWeek } from "../utils/dates.js";


/* -------------------------
   GET TODAY'S DAY + TAG
------------------------- */

// Today's weekday and the tag the user set for it in their weekly
// preferences (null if none, or if preferences can't be loaded).
export const fetchTodayInfo = async () => {
  const dayOfWeek = getTodayDayOfWeek();

  if (!getStorage().getItem(STORAGE_KEYS.token)) {
    return { dayOfWeek, todayTag: null };
  }

  try {
    const { data: preferences } = await getPreferences();

    return {
      dayOfWeek,
      todayTag: preferences?.[dayOfWeek] || null,
    };

  } catch (err) {
    console.error("Failed to fetch today's preferences:", err);

    return { dayOfWeek, todayTag: null };
  }
};
