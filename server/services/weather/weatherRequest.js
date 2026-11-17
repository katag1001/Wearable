// server/services/weather/weatherRequest.js
//
// Reading a weather request (GET /weather/forecast, /weather/typical:
// ?lat=&lon=&tz=&offset=) and rounding the location to its shared area.
// Pure - no I/O.

const { isTimeZone } = require("./localTime.js");

const MAX_OFFSET_MINUTES = 14 * 60;

const numberIn = (value, min, max) => {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;

  return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

// { latitude, longitude, zone: { tz, offsetMinutes } }, or null if the
// location is missing or out of range. A bad time zone is dropped (the
// offset is used instead); a bad offset counts as UTC.
const readWeatherQuery = (query = {}) => {
  const latitude = numberIn(query.lat, -90, 90);
  const longitude = numberIn(query.lon, -180, 180);

  if (latitude === null || longitude === null) return null;

  const offsetMinutes = numberIn(query.offset, -MAX_OFFSET_MINUTES, MAX_OFFSET_MINUTES) ?? 0;

  return {
    latitude,
    longitude,
    zone: {
      ...(isTimeZone(query.tz) && { tz: query.tz }),
      offsetMinutes: Math.round(offsetMinutes),
    },
  };
};

// Rounds to the nearest multiple of `step`, as a tidy number (no
// 51.500000001) - never more than 4 decimals, as MET Norway requires.
const roundTo = (value, step) => Number((Math.round(value / step) * step).toFixed(4)) || 0;

// The shared area for a location: { latitude, longitude, key }.
const areaFor = (latitude, longitude, step, prefix) => {
  const lat = roundTo(latitude, step);
  const lon = roundTo(longitude, step);

  return { latitude: lat, longitude: lon, key: `${prefix}:${lat},${lon}` };
};

module.exports = { readWeatherQuery, areaFor, roundTo };
