// core/weather/openMeteo.js
//
// Today's forecast from Open-Meteo (free, no key). Uses fetch rather than
// the API client so the login token is NOT sent to Open-Meteo.

import {
  DAYTIME_END_HOUR,
  DAYTIME_START_HOUR,
} from "../constants/daytimeHours.js";

// Hourly times come in the location's own time ("2026-10-15T07:00"), so
// the hour is read straight from the string.
const hourOf = (time) => Number(time.slice(11, 13));

// The min / max of today's hourly temperatures within the daytime hours,
// or null if there are none.
const daytimeRange = (hourly) => {
  if (!hourly?.time?.length) return null;

  const today = hourly.time[0].slice(0, 10);

  const temperatures = hourly.time
    .map((time, index) => ({ time, temperature: hourly.temperature_2m[index] }))
    .filter(
      ({ time, temperature }) =>
        time.startsWith(today) &&
        hourOf(time) >= DAYTIME_START_HOUR &&
        hourOf(time) <= DAYTIME_END_HOUR &&
        typeof temperature === "number"
    )
    .map(({ temperature }) => temperature);

  if (!temperatures.length) return null;

  return { min: Math.min(...temperatures), max: Math.max(...temperatures) };
};

// { min, max, code } for today at this location - min / max over the
// daytime hours (core/constants/daytimeHours.js), falling back to the
// whole day's if the hourly data is missing. null if the response has no
// forecast. Throws if the request fails.
export const fetchTodayForecast = async (latitude, longitude) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&hourly=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=1` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.daily) {
    return null;
  }

  const daytime = daytimeRange(data.hourly);

  return {
    min: daytime?.min ?? data.daily.temperature_2m_min[0],
    max: daytime?.max ?? data.daily.temperature_2m_max[0],
    code: data.daily.weather_code?.[0],
  };
};
