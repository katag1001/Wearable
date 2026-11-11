// core/weather/typicalWeather.js
//
// The typical weather for a day of the year - the Plan tab's estimate for
// days past the forecast (context/planning-feature.md).
//
// Open-Meteo's Historical Weather API (free, no key; fetch, so no login
// token goes with it): hourly temperatures for the last TYPICAL_YEARS
// years. Hourly, not daily, so each day's min / max is over the same
// daytime window as Today's (core/constants/daytimeHours.js) - the daily
// minimum is a night-time one. Averaged per day of the year, then smoothed
// over SMOOTHING_DAYS either side.
//
// Downloaded once per location (rounded to LOCATION_STEP degrees, ~50 km);
// only the worked-out table is kept: { "MM-DD": { min, max } }, 366 days.

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { daytimeRangesByDate } from "./openMeteo.js";

const TYPICAL_YEARS = 3;
const SMOOTHING_DAYS = 7;
const LOCATION_STEP = 0.5;
// The archive is a few days behind.
const ARCHIVE_LAG_DAYS = 7;
// Bump to fetch every table again after changing how it's worked out.
const TABLE_VERSION = 1;

const DAY_MS = 24 * 60 * 60 * 1000;

const isoDate = (date) => date.toISOString().slice(0, 10);

const roundTo = (value, step) => Math.round(value / step) * step;
const oneDecimal = (value) => Math.round(value * 10) / 10;

// The cache key for a location ("51.5,-0").
export const locationKey = (latitude, longitude) =>
  `${roundTo(latitude, LOCATION_STEP)},${roundTo(longitude, LOCATION_STEP)}`;

// Every "MM-DD" of a leap year, in order.
const YEAR_DAYS = Array.from({ length: 366 }, (_, index) =>
  isoDate(new Date(Date.UTC(2024, 0, 1) + index * DAY_MS)).slice(5)
);

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

// Pure: { "MM-DD": { min, max } } from daily ranges ({ "YYYY-MM-DD":
// { min, max } }, several years) - each day of the year averaged over the
// years, then over SMOOTHING_DAYS either side (wrapping round the year).
export const typicalTableFrom = (dailyRanges) => {
  const byDay = new Map(YEAR_DAYS.map((day) => [day, { mins: [], maxes: [] }]));

  Object.entries(dailyRanges).forEach(([date, range]) => {
    const day = byDay.get(date.slice(5));

    if (day) {
      day.mins.push(range.min);
      day.maxes.push(range.max);
    }
  });

  const table = {};

  YEAR_DAYS.forEach((day, index) => {
    const mins = [];
    const maxes = [];

    for (let offset = -SMOOTHING_DAYS; offset <= SMOOTHING_DAYS; offset += 1) {
      const near = byDay.get(YEAR_DAYS[(index + offset + YEAR_DAYS.length) % YEAR_DAYS.length]);

      mins.push(...near.mins);
      maxes.push(...near.maxes);
    }

    if (mins.length) {
      table[day] = { min: oneDecimal(average(mins)), max: oneDecimal(average(maxes)) };
    }
  });

  return table;
};

const fetchTable = async (latitude, longitude, now) => {
  const end = new Date(now.getTime() - ARCHIVE_LAG_DAYS * DAY_MS);
  const start = new Date(end);
  start.setUTCFullYear(start.getUTCFullYear() - TYPICAL_YEARS);

  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&start_date=${isoDate(start)}` +
    `&end_date=${isoDate(end)}` +
    `&hourly=temperature_2m` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.hourly?.time?.length) return null;

  return typicalTableFrom(daytimeRangesByDate(data.hourly));
};

const readEntry = () => {
  try {
    return JSON.parse(getStorage().getItem(STORAGE_KEYS.typicalWeather));
  } catch {
    return null;
  }
};

// The table for this location: the stored one, else downloaded (and
// stored). null if it can't be had. Throws if the request fails.
export const getTypicalWeatherTable = async (latitude, longitude, now = new Date()) => {
  const key = locationKey(latitude, longitude);
  const stored = readEntry();

  if (stored?.key === key && stored.version === TABLE_VERSION && stored.table) {
    return stored.table;
  }

  const table = await fetchTable(latitude, longitude, now);

  if (table) {
    try {
      getStorage().setItem(
        STORAGE_KEYS.typicalWeather,
        JSON.stringify({ key, version: TABLE_VERSION, table })
      );
    } catch (err) {
      console.error("Failed to store the typical weather:", err);
    }
  }

  return table;
};
