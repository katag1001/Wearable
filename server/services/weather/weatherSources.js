// server/services/weather/weatherSources.js
//
// The two outside weather sources, called only by this server.
//
// MET Norway Locationforecast (https://api.met.no/doc/TermsOfService):
// free, including for paid apps, on these terms - every request says who's
// calling (User-Agent with a contact), coordinates have at most 4
// decimals, a forecast isn't asked for again before its Expires time
// (If-Modified-Since when it is), total traffic stays under 20 requests a
// second (we cap ourselves lower: constants/weather.js), and the app
// credits "MET Norway". A 203 answer means this API version is being
// retired (usually within a month).
//
// NASA POWER (https://power.larc.nasa.gov): hourly temperature history,
// free, no key; one request per area (their grid is 0.5°), credited in
// the app.

const {
  APP_NAME,
  APP_VERSION,
  MET_FORECAST_URL,
  POWER_HOURLY_URL,
  REQUEST_TIMEOUT_MS,
} = require("../../constants/weather.js");
const { seriesFromForecast } = require("./forecastDays.js");

class WeatherSourceError extends Error {
  constructor(message, { refused = false } = {}) {
    super(message);
    this.refused = refused;
  }
}

// "LovedWornSeen/1.0 <contact>". MET Norway bans requests without a real
// contact, so there's no fallback: without MET_CONTACT nothing is sent.
const metUserAgent = (contact) => {
  if (typeof contact !== "string" || !contact.trim()) {
    throw new WeatherSourceError("MET_CONTACT isn't set, so MET Norway can't be called");
  }

  return `${APP_NAME}/${APP_VERSION} ${contact.trim()}`;
};

const dateHeader = (response, name) => {
  const value = response.headers.get(name);
  const date = value ? new Date(value) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
};

// The forecast for an area ({ latitude, longitude }, already rounded).
// Resolves to { notModified: true, expires } (when `lastModified` was sent
// and nothing changed) or { series, expires, lastModified, deprecated }.
// Throws WeatherSourceError (refused: true for 429 / 403).
const fetchMetForecast = async ({ latitude, longitude }, { lastModified, contact }) => {
  const headers = { "User-Agent": metUserAgent(contact) };
  if (lastModified) headers["If-Modified-Since"] = lastModified;

  const response = await fetch(`${MET_FORECAST_URL}?lat=${latitude}&lon=${longitude}`, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 304) {
    return { notModified: true, expires: dateHeader(response, "expires") };
  }

  if (response.status === 429 || response.status === 403) {
    throw new WeatherSourceError(`MET Norway refused the request (${response.status})`, { refused: true });
  }

  if (response.status !== 200 && response.status !== 203) {
    throw new WeatherSourceError(`MET Norway answered ${response.status}`);
  }

  const series = seriesFromForecast(await response.json());

  if (!series.length) throw new WeatherSourceError("MET Norway sent no forecast");

  return {
    series,
    expires: dateHeader(response, "expires"),
    lastModified: response.headers.get("last-modified") || undefined,
    deprecated: response.status === 203,
  };
};

const compactDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");

// NASA POWER hourly temperatures (UTC) for an area between two dates:
// { "YYYYMMDDHH": temperature }. One request a year, one after another.
const fetchPowerHourly = async ({ latitude, longitude }, start, end) => {
  const readings = {};
  let from = new Date(start);

  while (from <= end) {
    const to = new Date(Math.min(end.getTime(), Date.UTC(from.getUTCFullYear(), 11, 31)));
    const url =
      `${POWER_HOURLY_URL}?parameters=T2M&community=SB` +
      `&longitude=${longitude}&latitude=${latitude}` +
      `&start=${compactDate(from)}&end=${compactDate(to)}` +
      "&format=JSON&time-standard=UTC";

    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS * 3) });

    if (!response.ok) throw new WeatherSourceError(`NASA POWER answered ${response.status}`);

    const body = await response.json();
    Object.assign(readings, body?.properties?.parameter?.T2M || {});

    from = new Date(Date.UTC(from.getUTCFullYear() + 1, 0, 1));
  }

  return readings;
};

module.exports = { fetchMetForecast, fetchPowerHourly, metUserAgent, WeatherSourceError };
