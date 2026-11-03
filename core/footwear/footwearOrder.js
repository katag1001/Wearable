// core/footwear/footwearOrder.js
//
// Inputs to and the stability of each Today outfit's shoe order
// (core/hooks/useTodayFootwear.js).

import { getTodayWeatherEntry } from "../weather/weatherCache.js";

// Today's forecast { min, max, code }, from the weather cache.
export const readTodayWeather = () => {
  const cached = getTodayWeatherEntry();

  return { weather: cached?.weather || null };
};

// Puts an outfit's cached order back if it was for the same bottom,
// dropping deleted shoes and adding new ones (in ranked order) at the end.
export const applyCachedOrder = (ranked, cachedOrder, bottomSubtype) => {
  if (!cachedOrder || (cachedOrder.bottomSubtype ?? null) !== bottomSubtype) {
    return ranked;
  }

  const byId = new Map(ranked.map((item) => [item._id, item]));

  const kept = cachedOrder.footwearIds
    .map((id) => byId.get(id))
    .filter(Boolean);

  const keptIds = new Set(kept.map((item) => item._id));

  return [...kept, ...ranked.filter((item) => !keptIds.has(item._id))];
};
