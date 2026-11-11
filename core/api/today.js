// core/api/today.js

import { api } from "./client.js";

// Today's outfits in today's order (ranked and capped on the server), and
// the outfit worn today if there is one - each as { matchId: <match> } -
// and the notice when few outfits fit the weather ({ level, band } or null;
// core/today/weatherNotice.js).
// `todayStart` is the user's local midnight (ISO). The list is empty
// while the server is still building it.
export const fetchTodayOutfits = async (todayStart) => {
  const response = await api.get("/today/get", {
    params: { today_start: todayStart },
  });

  const data = response.data;

  // A server from before ranking moved there sends just the list.
  if (Array.isArray(data)) {
    return { outfits: data, wornToday: null, notice: null };
  }

  return {
    outfits: Array.isArray(data?.outfits) ? data.outfits : [],
    wornToday: data?.wornToday ?? null,
    notice: data?.notice ?? null,
  };
};

// Builds today's outfit list on the server from the day's temperature
// range, season (for the seasonal points) and weekday (for the weekly
// tag) - once per day; a second
// call that day returns { alreadyBuilt: true }. `todayStart` is the
// user's local midnight (ISO), `todayDate` their local "YYYY-MM-DD" -
// planned days up to today are worn first; `plannedWorn` in the response
// is today's plan's undo values (core/plan/plannedWorn.js), or null.
export const createToday = async ({
  minTemp,
  maxTemp,
  season,
  todayStart,
  dayOfWeek,
  todayDate,
}) => {
  const response = await api.post("/today/create", {
    min_temp_today: minTemp,
    max_temp_today: maxTemp,
    season_today: season,
    today_start: todayStart,
    day_of_week: dayOfWeek,
    today_date: todayDate,
  });

  return response.data;
};

// Another tag for today, from the Today tab - today only. The server
// re-orders today's list for it, or builds it again when too few of its
// outfits have the tag (takes the same weather as createToday). Resolves
// { rebuilt }; fetch the list again afterwards.
export const changeTodayTag = async ({
  tag,
  minTemp,
  maxTemp,
  season,
  todayStart,
}) => {
  const response = await api.post("/today/tag", {
    tag,
    min_temp_today: minTemp,
    max_temp_today: maxTemp,
    season_today: season,
    today_start: todayStart,
  });

  return response.data;
};
