// core/weather/forecastCache.js
//
// The days of forecast fetched with today's weather (core/hooks/useWeather.js,
// once a day), kept for the Plan tab:
// { savedOn: "YYYY-MM-DD", location, days: { "YYYY-MM-DD": { min, max, code } } }.

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { getTodayDate } from "../utils/dates.js";

const readEntry = () => {
  try {
    return JSON.parse(getStorage().getItem(STORAGE_KEYS.forecast));
  } catch {
    return null;
  }
};

// The cached entry if it was saved today, otherwise null.
export const getTodayForecastEntry = () => {
  const entry = readEntry();

  return entry?.savedOn === getTodayDate() && entry.days ? entry : null;
};

export const cacheForecast = (days, location) => {
  try {
    getStorage().setItem(
      STORAGE_KEYS.forecast,
      JSON.stringify({ savedOn: getTodayDate(), location, days })
    );
  } catch (err) {
    console.error("Failed to cache the forecast:", err);
  }
};
