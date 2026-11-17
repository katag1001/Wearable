// core/weather/typicalWeather.js
//
// The typical weather for a day of the year - the Plan tab's estimate for
// days past the forecast (context/planning-feature.md).
//
// Worked out by our server (core/api/weather.js; the server uses NASA
// POWER's hourly history for the area, averaged over a few years, over the
// same daytime window as Today's). Fetched once per location (rounded to
// LOCATION_STEP degrees, ~50 km, the same squares the server uses) and
// kept: { "MM-DD": { min, max } }, 366 days.

import { getTypicalWeather } from "../api/weather.js";
import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";

const LOCATION_STEP = 0.5;
// Bump to fetch every table again after changing how it's worked out.
// 2: from our server (NASA POWER) instead of fetched by the phone.
const TABLE_VERSION = 2;

const roundTo = (value, step) => Math.round(value / step) * step;

// The cache key for a location ("51.5,-0").
export const locationKey = (latitude, longitude) =>
  `${roundTo(latitude, LOCATION_STEP)},${roundTo(longitude, LOCATION_STEP)}`;

const readEntry = () => {
  try {
    return JSON.parse(getStorage().getItem(STORAGE_KEYS.typicalWeather));
  } catch {
    return null;
  }
};

// The table for this location: the stored one, else fetched (and stored).
// null if it can't be had. Throws if the request fails.
export const getTypicalWeatherTable = async (latitude, longitude) => {
  const key = locationKey(latitude, longitude);
  const stored = readEntry();

  if (stored?.key === key && stored.version === TABLE_VERSION && stored.table) {
    return stored.table;
  }

  const table = await getTypicalWeather(latitude, longitude);

  if (!table || !Object.keys(table).length) return null;

  try {
    getStorage().setItem(
      STORAGE_KEYS.typicalWeather,
      JSON.stringify({ key, version: TABLE_VERSION, table })
    );
  } catch (err) {
    console.error("Failed to store the typical weather:", err);
  }

  return table;
};
