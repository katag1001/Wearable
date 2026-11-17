// core/plan/dayWeather.js
//
// The weather for a planned day: the forecast up to FORECAST_DAYS_AHEAD
// days ahead (core/weather/forecastCache.js), the typical weather for the
// time of year after that (core/weather/typicalWeather.js) - always shown
// as an estimate. { kind: "forecast" | "estimate", min, max, code }
// (code null for an estimate).

import { FORECAST_DAYS_AHEAD } from "../weather/forecast.js";
import { getWeatherTempOffset } from "../weather/weatherCodes.js";
import { daysFromToday, fromPlanDate, getSeason } from "../utils/dates.js";

// Pure: the day's weather from the forecast days and the typical-weather
// table, or null when neither has it.
export const dayWeatherFor = (planDate, { forecastDays, typicalTable }) => {
  const forecast = forecastDays?.[planDate];

  if (forecast && daysFromToday(planDate) <= FORECAST_DAYS_AHEAD) {
    return { kind: "forecast", min: forecast.min, max: forecast.max, code: forecast.code ?? null };
  }

  const typical = typicalTable?.[planDate.slice(5)];

  return typical ? { kind: "estimate", min: typical.min, max: typical.max, code: null } : null;
};

// Whether the day needs the typical-weather table (past the forecast).
export const needsEstimate = (planDate) => daysFromToday(planDate) > FORECAST_DAYS_AHEAD;

const degrees = (value) => `${Math.round(value)}°`;

// "6° – 11°".
export const temperatureText = (weather) => `${degrees(weather.min)} – ${degrees(weather.max)}`;

// The line under the temperature: "Forecast", or the estimate's note.
export const dayWeatherNote = (weather) =>
  weather.kind === "estimate"
    ? `Estimate: usually ${degrees(weather.min)} – ${degrees(weather.max)} around this time of year`
    : "Forecast";

// Where the day's weather comes from, as their terms ask us to credit
// (server/services/weather/weatherSources.js).
export const dayWeatherSource = (weather) =>
  weather.kind === "estimate" ? "Based on NASA POWER data" : "Data from MET Norway";

// The day's weather as the server picks outfits from it (as Today's -
// core/today/createTodayOnce.js todayWeatherParams): the range shifted by
// the weather offset, and the day's season where the user is.
export const dayWeatherParams = (planDate, weather, latitude) => {
  const offset = getWeatherTempOffset(weather.code);

  return {
    minTemp: weather.min + offset,
    maxTemp: weather.max + offset,
    season: getSeason(fromPlanDate(planDate), latitude),
  };
};
