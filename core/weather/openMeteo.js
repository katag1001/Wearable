// core/weather/openMeteo.js
//
// Today's forecast from Open-Meteo (free, no key). Uses fetch rather than
// the API client so the login token is NOT sent to Open-Meteo.

// { min, max, code } for today at this location, or null if the response
// has no daily forecast. Throws if the request fails.
export const fetchTodayForecast = async (latitude, longitude) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.daily) {
    return null;
  }

  return {
    min: data.daily.temperature_2m_min[0],
    max: data.daily.temperature_2m_max[0],
    code: data.daily.weather_code?.[0],
  };
};
