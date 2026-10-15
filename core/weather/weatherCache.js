// core/weather/weatherCache.js
//
// Today's forecast is fetched once a day and kept in storage as
// { date, location: { latitude, longitude }, weather: { min, max, code } }.
// The outfit sort and the shoe box read it from here.

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { isDateToday } from "../utils/dates.js";

const readEntry = () => {
  try {
    return JSON.parse(getStorage().getItem(STORAGE_KEYS.weather));
  } catch {
    return null;
  }
};

// The cached entry if it was saved today, otherwise null.
export const getTodayWeatherEntry = () => {
  const entry = readEntry();

  return entry?.date && isDateToday(entry.date) ? entry : null;
};

// The last entry / forecast saved, whatever day it was for - null if none.
export const getLastWeatherEntry = () => readEntry();
export const getLastWeather = () => readEntry()?.weather ?? null;

export const cacheWeather = (weather, location) => {
  getStorage().setItem(
    STORAGE_KEYS.weather,
    JSON.stringify({
      date: new Date().toISOString(),
      location,
      weather,
    })
  );
};
