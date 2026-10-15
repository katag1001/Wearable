// core/weather/weatherCodes.js
//
// What the day's WMO weather code (from Open-Meteo) means for the app.


/* -------------------------
   WEATHER TEMPERATURE OFFSET
------------------------- */

// Nudges the temperature range used for outfit matching based on the day's
// WMO weather code. Sunny days are treated as slightly warmer, rain/snow and
// showers/storms as colder. Anything else (cloud, fog, drizzle) or a missing
// code leaves the range unchanged. The real temperature is still displayed.
export const getWeatherTempOffset = (weatherCode) => {
  if (typeof weatherCode !== "number") return 0;

  if (weatherCode === 0) return 0.5;
  if (weatherCode >= 61 && weatherCode <= 77) return -0.5;
  if (weatherCode >= 80 && weatherCode <= 99) return -1;

  return 0;
};


/* -------------------------
   WEATHER EMOJI
------------------------- */

// Emoji for the day's WMO weather code. Missing code (e.g. weather cached
// before codes were fetched) returns an empty string.
export const getWeatherEmoji = (weatherCode) => {
  if (typeof weatherCode !== "number") return "";

  if (weatherCode === 0) return "☀️";
  if (weatherCode <= 2) return "🌤️";
  if (weatherCode === 3) return "☁️";
  if (weatherCode <= 48) return "🌫️";
  if (weatherCode <= 67) return "🌧️";
  if (weatherCode <= 77) return "❄️";
  if (weatherCode <= 82) return "🌦️";
  if (weatherCode <= 86) return "🌨️";

  return "⛈️";
};
