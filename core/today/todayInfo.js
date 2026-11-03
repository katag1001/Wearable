// core/today/todayInfo.js

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { getPreferences } from "../api/preferences.js";
import { getTodayDayOfWeek } from "../utils/dates.js";
import { findTagOption } from "../utils/tagOptions.js";

// Today's tag when the user hasn't set one for the day - or has one that's
// no longer a tag (e.g. from before the tags were renamed). The server
// falls back to the same tag (DEFAULT_TODAY_TAG in
// server/constants/todayOutfits.js).
export const DEFAULT_TODAY_TAG = "Elevated everyday";

// A weekly-preference tag as the tagOptions name outfits use, or the
// default.
export const todayTagFor = (preferenceTag) =>
  findTagOption(preferenceTag)?.name || DEFAULT_TODAY_TAG;


/* -------------------------
   GET TODAY'S DAY + TAG
------------------------- */

// Today's weekday and the tag the user set for it in their weekly
// preferences (DEFAULT_TODAY_TAG if none, or if preferences can't be
// loaded).
export const fetchTodayInfo = async () => {
  const dayOfWeek = getTodayDayOfWeek();

  if (!getStorage().getItem(STORAGE_KEYS.token)) {
    return { dayOfWeek, todayTag: DEFAULT_TODAY_TAG };
  }

  try {
    const { data: preferences } = await getPreferences();

    return {
      dayOfWeek,
      todayTag: todayTagFor(preferences?.[dayOfWeek]),
    };

  } catch (err) {
    console.error("Failed to fetch today's preferences:", err);

    return { dayOfWeek, todayTag: DEFAULT_TODAY_TAG };
  }
};
