// core/weather/weatherCache.js
//
// Today's forecast is fetched once a day and kept in storage as
// { date, daytime, location: { latitude, longitude }, weather: { min, max, code } }.
// The outfit sort and the shoe box read it from here. `daytime` is the
// window the min / max cover (core/constants/daytimeHours.js), so changing
// the window fetches today's forecast again instead of reusing the old one.

import { getStorage } from "../config.js";
import { DAYTIME_END, DAYTIME_START } from "../constants/daytimeHours.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { isDateToday } from "../utils/dates.js";

const DAYTIME_WINDOW = `${DAYTIME_START}-${DAYTIME_END}`;

const readEntry = () => {
  try {
    return JSON.parse(getStorage().getItem(STORAGE_KEYS.weather));
  } catch {
    return null;
  }
};

// The cached entry if it was saved today for the current daytime window,
// otherwise null.
export const getTodayWeatherEntry = () => {
  const entry = readEntry();

  return entry?.date && isDateToday(entry.date) && entry.daytime === DAYTIME_WINDOW
    ? entry
    : null;
};

// The last entry / forecast saved, whatever day it was for - null if none.
export const getLastWeatherEntry = () => readEntry();
export const getLastWeather = () => readEntry()?.weather ?? null;

export const cacheWeather = (weather, location) => {
  getStorage().setItem(
    STORAGE_KEYS.weather,
    JSON.stringify({
      date: new Date().toISOString(),
      daytime: DAYTIME_WINDOW,
      location,
      weather,
    })
  );
};
