// server/services/weatherService.js
//
// The weather for the apps (controllers/weatherControllers.js):
//
// getForecastDays - today and the next 7 days ({ "YYYY-MM-DD": { min, max,
// code } }) from MET Norway. Everyone in the same ~10 km area shares one
// forecast, reused until it expires (3 hours at least), so calls to MET
// Norway grow with places, not users. Calls are capped at
// MET_CALLS_PER_SECOND for the whole app. When MET Norway can't be asked
// (down, over our cap, paused after it refused us), the area's older copy
// (up to a day old) stands in; with none, it fails and the app uses its
// own last forecast (core/hooks/useWeather.js).
//
// getTypicalTable - the typical weather per day of the year
// ({ "MM-DD": { min, max } }) for days past the forecast, from NASA POWER's
// hourly history, one table per ~50 km area, kept for half a year.

const {
  ARCHIVE_LAG_DAYS,
  DAYTIME_END,
  DAYTIME_START,
  FORECAST_AREA_STEP,
  FORECAST_DAYS,
  KEEP_FORECAST_MS,
  KEEP_TYPICAL_MS,
  MIN_FRESH_MS,
  PAUSE_AFTER_REFUSAL_MS,
  SMOOTHING_DAYS,
  TYPICAL_AREA_STEP,
  TYPICAL_YEARS,
  WAIT_FOR_OTHERS_MS,
} = require("../constants/weather.js");
const store = require("./weather/weatherStore.js");
const { fetchMetForecast, fetchPowerHourly } = require("./weather/weatherSources.js");
const { forecastDaysFrom } = require("./weather/forecastDays.js");
const { daytimeRangesFromHourly, typicalTableFrom } = require("./weather/typicalTable.js");
const { areaFor } = require("./weather/weatherRequest.js");

const DAYTIME = { start: DAYTIME_START, end: DAYTIME_END };
const DAY_MS = 24 * 60 * 60 * 1000;

class WeatherUnavailableError extends Error {}

/* -------------------- Forecast -------------------- */

// A fresh forecast for the area from MET Norway, saved for everyone - or,
// when it can't be had, `stale` (the older copy, possibly null).
async function refreshForecast(area, stale) {
  if (await store.isMetPaused()) return stale;

  const locked = await store.claimFetchLock(area.key, KEEP_FORECAST_MS);

  if (!locked) {
    // Someone else is fetching it: use the older copy, or wait for theirs.
    if (stale?.data) return stale;
    const theirs = await store.waitForData(area.key, WAIT_FOR_OTHERS_MS);
    if (theirs) return theirs;
  }

  try {
    if (!(await store.claimMetSlot())) {
      console.warn("[weather] over our MET Norway limit this second: using the older forecast");
      return stale;
    }

    const result = await fetchMetForecast(area, {
      lastModified: stale?.data ? stale.lastModified : undefined,
      contact: process.env.MET_CONTACT,
    });

    const freshUntil = new Date(Math.max(result.expires?.getTime() || 0, Date.now() + MIN_FRESH_MS));

    if (result.notModified && stale?.data) {
      await store.saveEntry(area.key, { kind: "forecast", data: stale.data, freshUntil, lastModified: stale.lastModified }, KEEP_FORECAST_MS);
      return { ...stale, freshUntil };
    }

    if (result.deprecated) {
      console.warn("[weather] MET Norway answered 203: this API version is beta or being retired (usually within a month) - update it");
    }

    const entry = { kind: "forecast", data: { series: result.series }, freshUntil, lastModified: result.lastModified };
    await store.saveEntry(area.key, entry, KEEP_FORECAST_MS);

    return entry;
  } catch (error) {
    if (error.refused) {
      console.error(`[weather] ${error.message}: pausing MET Norway calls`);
      await store.pauseMet(PAUSE_AFTER_REFUSAL_MS);
    } else {
      console.error("[weather] forecast fetch failed:", error.message || error);
    }

    return stale;
  } finally {
    if (locked) await store.releaseFetchLock(area.key);
  }
}

// { "YYYY-MM-DD": { min, max, code } } for today and the next 7 days at
// this location, in the user's local days (`zone`). Throws
// WeatherUnavailableError if there's no forecast to be had.
async function getForecastDays({ latitude, longitude, zone, now = new Date() }) {
  const area = areaFor(latitude, longitude, FORECAST_AREA_STEP, "forecast");

  let entry = await store.getEntry(area.key);

  if (!entry?.data || !(entry.freshUntil > now)) {
    entry = await refreshForecast(area, entry?.data ? entry : null);
  }

  if (!entry?.data?.series?.length) throw new WeatherUnavailableError("No forecast available");

  const { days, unknownSymbols } = forecastDaysFrom(entry.data.series, {
    zone,
    now,
    dayCount: FORECAST_DAYS,
    daytime: DAYTIME,
  });

  if (unknownSymbols.length) {
    console.warn("[weather] unknown MET Norway symbols, shown as cloudy:", unknownSymbols.join(", "));
  }

  if (!Object.keys(days).length) throw new WeatherUnavailableError("The forecast has no days left");

  return days;
}

/* -------------------- Typical weather -------------------- */

// { "MM-DD": { min, max } } for this location. Throws
// WeatherUnavailableError if NASA POWER can't be reached and there's no
// saved table.
async function getTypicalTable({ latitude, longitude, zone, now = new Date() }) {
  const area = areaFor(latitude, longitude, TYPICAL_AREA_STEP, "typical");

  const saved = await store.getEntry(area.key);
  if (saved?.data?.table) return saved.data.table;

  const locked = await store.claimFetchLock(area.key, KEEP_TYPICAL_MS);

  if (!locked) {
    const theirs = await store.waitForData(area.key, WAIT_FOR_OTHERS_MS * 3);
    if (theirs?.data?.table) return theirs.data.table;
  }

  try {
    const end = new Date(now.getTime() - ARCHIVE_LAG_DAYS * DAY_MS);
    const start = new Date(end);
    start.setUTCFullYear(start.getUTCFullYear() - TYPICAL_YEARS);

    const hourly = await fetchPowerHourly(area, start, end);
    const table = typicalTableFrom(daytimeRangesFromHourly(hourly, zone, DAYTIME), SMOOTHING_DAYS);

    if (!Object.keys(table).length) throw new WeatherUnavailableError("NASA POWER sent no readings");

    await store.saveEntry(area.key, { kind: "typical", data: { table } }, KEEP_TYPICAL_MS);

    return table;
  } catch (error) {
    console.error("[weather] typical weather fetch failed:", error.message || error);
    throw new WeatherUnavailableError("No typical weather available");
  } finally {
    if (locked) await store.releaseFetchLock(area.key);
  }
}

module.exports = { getForecastDays, getTypicalTable, WeatherUnavailableError };
