import { useEffect, useState } from "react";

import { dayWeatherFor, needsEstimate } from "../plan/dayWeather.js";
import { cacheForecast, getTodayForecastEntry } from "../weather/forecastCache.js";
import { getLastWeatherEntry } from "../weather/weatherCache.js";
import { fetchForecast } from "../weather/openMeteo.js";
import { getTypicalWeatherTable } from "../weather/typicalWeather.js";

/*
 * A planned day's weather (core/plan/dayWeather.js): the forecast within
 * the next week, the typical weather for the time of year after that.
 *
 * The forecast comes from the copy Today fetched this morning, else it's
 * fetched here (and kept). The typical weather is downloaded once per
 * location and kept. `latitude` / `longitude`: the phone's location, if
 * known yet - otherwise the one saved with the last weather.
 *
 * { weather ({ kind, min, max, code } or null), loading, error, latitude }.
 */
export const useDayWeather = ({ date, latitude = null, longitude = null }) => {
  const [state, setState] = useState({ weather: null, loading: true, error: null });

  const saved = getTodayForecastEntry()?.location ?? getLastWeatherEntry()?.location ?? null;
  const lat = latitude ?? saved?.latitude ?? null;
  const lon = longitude ?? saved?.longitude ?? null;

  useEffect(() => {
    if (!date) return;

    let cancelled = false;

    const load = async () => {
      try {
        let forecastDays = getTodayForecastEntry()?.days ?? null;
        let typicalTable = null;

        if (lat === null || lon === null) {
          const weather = dayWeatherFor(date, { forecastDays, typicalTable });

          if (!cancelled) {
            setState({
              weather,
              loading: false,
              error: weather ? null : "Turn on location to see the weather for this day.",
            });
          }
          return;
        }

        if (needsEstimate(date)) {
          typicalTable = await getTypicalWeatherTable(lat, lon);
        } else if (!forecastDays?.[date]) {
          forecastDays = await fetchForecast(lat, lon);
          if (forecastDays) cacheForecast(forecastDays, { latitude: lat, longitude: lon });
        }

        const weather = dayWeatherFor(date, { forecastDays, typicalTable });

        if (!cancelled) {
          setState({
            weather,
            loading: false,
            error: weather ? null : "Couldn't find the weather for this day.",
          });
        }
      } catch (err) {
        console.error("Day weather failed:", err);

        if (!cancelled) {
          setState({ weather: null, loading: false, error: "Couldn't load the weather for this day." });
        }
      }
    };

    setState((prev) => ({ ...prev, loading: true, error: null }));
    load();

    return () => {
      cancelled = true;
    };
  }, [date, lat, lon]);

  return { ...state, latitude: lat };
};
