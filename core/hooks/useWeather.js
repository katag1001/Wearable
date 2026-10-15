import { useEffect, useState } from "react";

import { createTodayOnce } from "../today/createTodayOnce.js";
import { getSeason } from "../utils/dates.js";
import {
  cacheWeather,
  getLastWeatherEntry,
  getTodayWeatherEntry,
} from "../weather/weatherCache.js";
import { fetchTodayForecast } from "../weather/openMeteo.js";

/*
 * Today's weather and season, and getting today's outfits made.
 *
 * The forecast is fetched once a day for the user's location (each app
 * passes it in: the browser's / the phone's) and cached; later loads use
 * the cache. Then /today/create runs (once a day) and `ready` turns true -
 * the Today outfits can load (useToday's todayReady).
 *
 * Without a location (refused or failed - `locationUnavailable`) or if the
 * forecast request fails, it falls back to the last forecast saved on an
 * earlier day (`isFallback`); with none, Today is made ready anyway so it
 * shows what the server has instead of waiting forever.
 */
export const useWeather = ({ latitude, longitude, locationUnavailable = false }) => {
  const cached = getTodayWeatherEntry();

  const [weather, setWeather] = useState(cached ? cached.weather : null);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  // Live location first, then the location stored with today's weather.
  const season = getSeason(
    new Date(),
    latitude ?? cached?.location?.latitude
  );

  const fetchWeather = async (lat, lon) => {
    try {
      console.log("Fetching new weather...");

      const forecast = await fetchTodayForecast(lat, lon);

      if (!forecast) return;

      setWeather(forecast);
      cacheWeather(forecast, { latitude: lat, longitude: lon });

      await createTodayOnce(forecast, getSeason(new Date(), lat));

      setReady(true);
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setError("Failed to fetch weather data.");

      await fallBackToLastWeather();
    }
  };

  const fallBackToLastWeather = async () => {
    const last = getLastWeatherEntry();

    if (last?.weather) {
      setWeather(last.weather);
      setIsFallback(true);

      await createTodayOnce(
        last.weather,
        getSeason(new Date(), last.location?.latitude)
      );
    }

    setReady(true);
  };

  useEffect(() => {
    const todayEntry = getTodayWeatherEntry();

    if (todayEntry) {
      console.log("Using cached weather.");

      createTodayOnce(
        todayEntry.weather,
        getSeason(new Date(), todayEntry.location?.latitude)
      ).then(() => setReady(true));

      return;
    }

    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    } else if (locationUnavailable) {
      fallBackToLastWeather();
    }
    // Re-runs only when the location arrives / changes or is refused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, locationUnavailable]);

  return { weather, season, isFallback, error, ready };
};
