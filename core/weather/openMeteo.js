// core/weather/openMeteo.js
//
// Today's forecast from Open-Meteo (free, no key). Uses fetch rather than
// the API client so the login token is NOT sent to Open-Meteo.

import { DAYTIME_END, DAYTIME_START } from "../constants/daytimeHours.js";

// 15-minute times come in the location's own time ("2026-10-15T07:30"),
// so the "HH:MM" is read straight from the string - and compares as text.
const clockOf = (time) => time.slice(11, 16);

// The min / max of today's 15-minute temperatures within the daytime
// window, or null if there are none.
const daytimeRange = (readings) => {
  if (!readings?.time?.length) return null;

  const today = readings.time[0].slice(0, 10);

  const temperatures = readings.time
    .map((time, index) => ({ time, temperature: readings.temperature_2m[index] }))
    .filter(
      ({ time, temperature }) =>
        time.startsWith(today) &&
        clockOf(time) >= DAYTIME_START &&
        clockOf(time) <= DAYTIME_END &&
        typeof temperature === "number"
    )
    .map(({ temperature }) => temperature);

  if (!temperatures.length) return null;

  return { min: Math.min(...temperatures), max: Math.max(...temperatures) };
};

// { min, max, code } for today at this location - min / max over the
// daytime window (core/constants/daytimeHours.js), falling back to the
// whole day's if the 15-minute data is missing. null if the response has
// no forecast. Throws if the request fails.
export const fetchTodayForecast = async (latitude, longitude) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&minutely_15=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=1` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.daily) {
    return null;
  }

  const daytime = daytimeRange(data.minutely_15);

  return {
    min: daytime?.min ?? data.daily.temperature_2m_min[0],
    max: daytime?.max ?? data.daily.temperature_2m_max[0],
    code: data.daily.weather_code?.[0],
  };
};
