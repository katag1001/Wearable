// core/api/plan.js
//
// The Plan tab (server/controllers/planControllers.js). Dates are the
// user's local "YYYY-MM-DD" (core/utils/dates.js toPlanDate).

import { getTodayDate, getTodayStartISO } from "../utils/dates.js";
import { api } from "./client.js";

// The plans from `from` to `to`, by date:
// [{ date, outfit: { matchId: <match> }, footwear: <shoe> | null }].
export const fetchPlans = async (from, to) => {
  const response = await api.get("/plan", { params: { from, to } });

  return Array.isArray(response.data?.plans) ? response.data.plans : [];
};

// The recommendations for a day: [{ matchId: <match>, withTights }], best
// first. `minTemp` / `maxTemp` already shifted by the weather offset
// (core/plan/dayWeather.js dayWeatherParams). Only outfits with one of
// `tags`.
export const suggestOutfits = async ({ date, minTemp, maxTemp, season, tags }) => {
  const response = await api.post("/plan/suggest", {
    date,
    min_temp: minTemp,
    max_temp: maxTemp,
    season,
    tags,
  });

  return Array.isArray(response.data?.outfits) ? response.data.outfits : [];
};

// Plans the outfit (and shoe, or null) for the day. Today itself is worn
// straight away: resolves { plannedWorn } - the undo values, or null.
export const planDay = async ({ date, matchId, footwearId = null }) => {
  const response = await api.put(`/plan/${date}`, {
    matchId,
    footwearId,
    today_date: getTodayDate(),
    today_start: getTodayStartISO(),
  });

  return { plannedWorn: response.data?.plannedWorn ?? null };
};

// The shoe locked to the day (null for none).
export const changePlanShoe = async (date, footwearId) => {
  const response = await api.put(`/plan/${date}/footwear`, { footwearId });

  return response.data;
};

export const removePlan = async (date) => {
  const response = await api.delete(`/plan/${date}`);

  return response.data;
};
