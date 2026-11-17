// core/api/weather.js
//
// The weather, from our server (server/controllers/weatherControllers.js),
// which fetches it from MET Norway (forecast) and NASA POWER (typical
// weather) and shares it between users in the same area. The phone sends
// its location and time zone so the server can work out its local days.

import { api } from "./client.js";

// The device's time zone ("Europe/London") if it can tell, and always its
// offset from UTC in minutes (east positive), in case it can't.
const zoneParams = () => {
  let tz;

  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    tz = undefined;
  }

  return { ...(tz && { tz }), offset: -new Date().getTimezoneOffset() };
};

// { "YYYY-MM-DD": { min, max, code } } for today and the next 7 days.
// Throws if the request fails.
export const getWeatherForecast = async (latitude, longitude) => {
  const response = await api.get("/weather/forecast", {
    params: { lat: latitude, lon: longitude, ...zoneParams() },
  });

  return response.data.days;
};

// { "MM-DD": { min, max } } - the typical weather for each day of the
// year. Throws if the request fails.
export const getTypicalWeather = async (latitude, longitude) => {
  const response = await api.get("/weather/typical", {
    params: { lat: latitude, lon: longitude, ...zoneParams() },
  });

  return response.data.table;
};
