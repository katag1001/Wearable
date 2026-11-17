// core/weather/forecast.js
//
// The forecast, from our server (core/api/weather.js; the server gets it
// from MET Norway). One request a day brings today and the next
// FORECAST_DAYS_AHEAD days: Today uses the first, the Plan tab the rest
// (core/weather/forecastCache.js).

import { getWeatherForecast } from "../api/weather.js";

// Days after today with a real forecast; later days get an estimate
// (core/weather/typicalWeather.js).
export const FORECAST_DAYS_AHEAD = 7;

// { "YYYY-MM-DD": { min, max, code } } for today and the next
// FORECAST_DAYS_AHEAD days at this location - min / max over the daytime
// window (core/constants/daytimeHours.js), code a WMO weather code
// (core/weather/weatherCodes.js). null if there's no forecast. Throws if
// the request fails.
export const fetchForecast = async (latitude, longitude) => {
  const days = await getWeatherForecast(latitude, longitude);

  return days && Object.keys(days).length ? days : null;
};

// The first day of a fetchForecast result ({ min, max, code }), or null.
export const firstDayOf = (days) => {
  const [first] = Object.keys(days || {}).sort();

  return first ? days[first] : null;
};
