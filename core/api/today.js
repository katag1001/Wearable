// core/api/today.js

import { api } from "./client.js";

// Today's outfits in today's order (ranked and capped on the server), and
// the outfit worn today if there is one - each as { matchId: <match> }.
// `todayStart` is the user's local midnight (ISO). The list is empty
// while the server is still building it.
export const fetchTodayOutfits = async (todayStart) => {
  const response = await api.get("/today/get", {
    params: { today_start: todayStart },
  });

  const data = response.data;

  // A server from before ranking moved there sends just the list.
  if (Array.isArray(data)) {
    return { outfits: data, wornToday: null };
  }

  return {
    outfits: Array.isArray(data?.outfits) ? data.outfits : [],
    wornToday: data?.wornToday ?? null,
  };
};

// Builds today's outfit list on the server from the day's temperature
// range, season and weekday (for the weekly tag) - once per day; a second
// call that day returns { alreadyBuilt: true }. `todayStart` is the
// user's local midnight (ISO).
export const createToday = async ({
  minTemp,
  maxTemp,
  season,
  todayStart,
  dayOfWeek,
}) => {
  const response = await api.post("/today/create", {
    min_temp_today: minTemp,
    max_temp_today: maxTemp,
    season_today: season,
    today_start: todayStart,
    day_of_week: dayOfWeek,
  });

  return response.data;
};
