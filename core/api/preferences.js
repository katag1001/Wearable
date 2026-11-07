// core/api/preferences.js

import { api } from "./client.js";

// The logged-in user's preferences ({ ok, data }); 404 if they have none yet.
export const getPreferences = async () => {
  const response = await api.get("/preferences");

  return response.data;
};

// Saves only the fields in `changes` (creates the preferences if needed).
export const updatePreferences = async (changes) => {
  const response = await api.put("/preferences", changes);

  return response.data;
};

// The outfit rebuild a preference change started: { running, remaining,
// total } (server/services/outfitRebuildService.js).
export const getOutfitRebuild = async () => {
  const response = await api.get("/preferences/rebuild");

  return response.data;
};

// Carries the outfit rebuild on for one chunk (about a minute) - call again
// while it answers `running: true`. Once it's done (or straight away with
// `refreshToday`, when no rebuild is running) the server builds today's
// list again from `today`: the weather as for createToday (core/api/today.js)
// plus `tag`, the tag picked for today. Without `today` the list is
// cleared and built on the next load instead.
// Resolves { running, remaining, total, todayRebuilt }.
export const continueOutfitRebuild = async ({ refreshToday = false, today = null } = {}) => {
  const response = await api.post("/preferences/rebuild", {
    refresh_today: refreshToday,
    ...(today && {
      min_temp_today: today.minTemp,
      max_temp_today: today.maxTemp,
      season_today: today.season,
      today_start: today.todayStart,
      day_of_week: today.dayOfWeek,
      tag: today.tag ?? undefined,
    }),
  });

  return response.data;
};
