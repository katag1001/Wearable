// server/constants/weather.js
//
// The weather the apps show (services/weatherService.js):
// - the forecast, from MET Norway's Locationforecast API (free, including
//   for paid apps; https://api.met.no/doc/TermsOfService), and
// - the typical weather for days past the forecast, from NASA POWER's
//   hourly history (https://power.larc.nasa.gov).
// Both are fetched by this server only and shared between everyone in the
// same area, so the number of calls grows with places, not users.

const daytimeHours = require("../../shared/daytimeHours.json");

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

module.exports = {
  /* ---------- MET Norway forecast ---------- */
  MET_FORECAST_URL: "https://api.met.no/weatherapi/locationforecast/2.0/compact",

  // Who's calling, in every request's User-Agent (MET Norway blocks
  // requests that don't say): "LovedWornSeen/1.0 <MET_CONTACT>". The
  // contact is the MET_CONTACT environment variable (server/.env, Vercel).
  APP_NAME: "LovedWornSeen",
  APP_VERSION: "1.0",

  // Everyone within the same 0.1° square (~10 km) shares one forecast.
  FORECAST_AREA_STEP: 0.1,

  // Today and the next 7 days (the Plan tab's forecast days).
  FORECAST_DAYS: 8,

  // A forecast is reused until MET Norway's Expires time, and at least
  // this long (they ask for no repeats within 3 hours outside the Nordics).
  MIN_FRESH_MS: 3 * HOUR_MS,

  // Kept this long in all, so an older copy can stand in when MET Norway
  // is down or we're over our own limit.
  KEEP_FORECAST_MS: DAY_MS,

  // Our own cap on calls to MET Norway, for the whole app (their limit is
  // 20 a second in total; anything over needs a special agreement).
  MET_CALLS_PER_SECOND: 15,

  // How long a request waits for room under the cap before using an older
  // copy instead.
  WAIT_FOR_SLOT_MS: 2000,

  // After MET Norway answers 429 (slow down) or 403, no calls for this long.
  PAUSE_AFTER_REFUSAL_MS: MINUTE_MS,

  /* ---------- NASA POWER typical weather ---------- */
  POWER_HOURLY_URL: "https://power.larc.nasa.gov/api/temporal/hourly/point",

  // NASA POWER's own grid is 0.5° (~50 km): one table per square.
  TYPICAL_AREA_STEP: 0.5,

  // Years of history averaged, ending this many days ago (the archive is a
  // few days behind).
  TYPICAL_YEARS: 3,
  ARCHIVE_LAG_DAYS: 7,

  // Each day of the year averaged with this many days either side.
  SMOOTHING_DAYS: 7,

  // A place's typical weather barely changes: kept half a year.
  KEEP_TYPICAL_MS: 180 * DAY_MS,

  /* ---------- Both ---------- */
  // The local times whose temperatures count (shared with the apps).
  DAYTIME_START: daytimeHours.start,
  DAYTIME_END: daytimeHours.end,

  // One person fetches a missing area; others wait this long for it.
  FETCH_LOCK_MS: 15 * 1000,
  WAIT_FOR_OTHERS_MS: 4000,

  // Give up on a single outside request after this long.
  REQUEST_TIMEOUT_MS: 10 * 1000,
};
