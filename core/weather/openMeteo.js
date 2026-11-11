// core/weather/openMeteo.js
//
// The forecast from Open-Meteo (free, no key). Uses fetch rather than
// the API client so the login token is NOT sent to Open-Meteo.
//
// One request a day brings today and the next FORECAST_DAYS_AHEAD days
// (still a single call to Open-Meteo - it only counts extra past 14 days):
// Today uses the first, the Plan tab the rest (core/weather/forecastCache.js).

import { DAYTIME_END, DAYTIME_START } from "../constants/daytimeHours.js";

// Days after today with a real forecast; later days get an estimate
// (core/weather/typicalWeather.js).
export const FORECAST_DAYS_AHEAD = 7;

// 15-minute times come in the location's own time ("2026-10-15T07:30"),
// so the "HH:MM" is read straight from the string - and compares as text.
const clockOf = (time) => time.slice(11, 16);
const dateOf = (time) => time.slice(0, 10);

const isDaytime = (time) => clockOf(time) >= DAYTIME_START && clockOf(time) <= DAYTIME_END;

// { "YYYY-MM-DD": { min, max } } - each day's daytime min / max of these
// readings ({ time: [...], [field]: [...] }). Days with none are left out.
export const daytimeRangesByDate = (readings, field = "temperature_2m") => {
  const ranges = {};

  (readings?.time || []).forEach((time, index) => {
    const temperature = readings[field]?.[index];

    if (!isDaytime(time) || typeof temperature !== "number") return;

    const date = dateOf(time);
    const range = ranges[date];

    ranges[date] = range
      ? { min: Math.min(range.min, temperature), max: Math.max(range.max, temperature) }
      : { min: temperature, max: temperature };
  });

  return ranges;
};

// { "YYYY-MM-DD": { min, max, code } } for today and the next `days - 1`
// days at this location - min / max over the daytime window
// (core/constants/daytimeHours.js), falling back to the whole day's if
// the 15-minute data is missing. null if the response has no forecast.
// Throws if the request fails.
export const fetchForecast = async (latitude, longitude, days = FORECAST_DAYS_AHEAD + 1) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&minutely_15=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=${days}` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.daily?.time?.length) {
    return null;
  }

  const daytime = daytimeRangesByDate(data.minutely_15);

  return Object.fromEntries(
    data.daily.time.map((date, index) => [
      date,
      {
        min: daytime[date]?.min ?? data.daily.temperature_2m_min[index],
        max: daytime[date]?.max ?? data.daily.temperature_2m_max[index],
        code: data.daily.weather_code?.[index],
      },
    ])
  );
};

// The first day of a fetchForecast result ({ min, max, code }), or null.
export const firstDayOf = (days) => {
  const [first] = Object.keys(days || {}).sort();

  return first ? days[first] : null;
};
