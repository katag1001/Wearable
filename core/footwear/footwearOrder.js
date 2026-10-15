// core/footwear/footwearOrder.js
//
// Inputs to and the stability of the Today shoe order
// (core/hooks/useTodayFootwear.js).

import { getSeason } from "../utils/dates.js";
import { getTodayWeatherEntry } from "../weather/weatherCache.js";

// Today's forecast { min, max, code } and season, from the weather cache.
export const readTodayWeather = () => {
  const cached = getTodayWeatherEntry();

  if (!cached?.weather) {
    return { weather: null, season: null };
  }

  return {
    weather: cached.weather,
    season: getSeason(new Date(), cached.location?.latitude ?? null),
  };
};

// Puts the cached order back for the same outfit and bottom, dropping
// deleted shoes and adding new ones (in ranked order) at the end.
export const applyCachedOrder = (ranked, cachedOrder, matchId, bottomSubtype) => {
  if (
    cachedOrder?.matchId !== matchId ||
    (cachedOrder?.bottomSubtype ?? null) !== bottomSubtype
  ) {
    return ranked;
  }

  const byId = new Map(ranked.map((item) => [item._id, item]));

  const kept = cachedOrder.footwearIds
    .map((id) => byId.get(id))
    .filter(Boolean);

  const keptIds = new Set(kept.map((item) => item._id));

  return [...kept, ...ranked.filter((item) => !keptIds.has(item._id))];
};
