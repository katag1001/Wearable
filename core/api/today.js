// core/api/today.js

import { api } from "./client.js";

// Today's outfits (each { matchId: <populated match> }) - an empty list
// while the server is still building them.
export const fetchTodayOutfits = async () => {
  const response = await api.get("/today/get");

  return Array.isArray(response.data) ? response.data : [];
};

// Builds today's outfit list on the server from the day's temperature
// range and season. `todayStart` is the user's local midnight (ISO).
export const createToday = async ({ minTemp, maxTemp, season, todayStart }) => {
  const response = await api.post("/today/create", {
    min_temp_today: minTemp,
    max_temp_today: maxTemp,
    season_today: season,
    today_start: todayStart,
  });

  return response.data;
};
