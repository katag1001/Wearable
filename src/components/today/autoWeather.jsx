import React, { useEffect, useState } from 'react';
import { useGeolocation } from "@uidotdev/usehooks";
import './autoWeather.css';
import { URL } from "../../config";

const AutoWeather = () => {
  const location = useGeolocation();
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const STORAGE_KEY = "weather_cache";

  const isToday = (dateString) => {
    const today = new Date();
    const storedDate = new Date(dateString);

    return (
      today.getFullYear() === storedDate.getFullYear() &&
      today.getMonth() === storedDate.getMonth() &&
      today.getDate() === storedDate.getDate()
    );
  };

  const getSeason = () => {
    const month = new Date().getMonth();

    if ([2, 3, 4].includes(month)) return "spring";
    if ([5, 6, 7].includes(month)) return "summer";
    if ([8, 9, 10].includes(month)) return "autumn";
    if ([11, 0, 1].includes(month)) return "winter";

    return "unknown";
  };

  const triggerCreateToday = async (min, max, season) => {
    try {
      const token = localStorage.getItem("token");

      console.log("========== CREATE TODAY ==========");
      console.log("Token found:", !!token);
      console.log("Token:", token);
      console.log("Sending:");
      console.log({
        min_temp_today: min,
        max_temp_today: max,
        season_today: season,
      });

      const response = await fetch(`${URL}/today/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          min_temp_today: min,
          max_temp_today: max,
          season_today: season,
        }),
      });

      console.log("Status:", response.status);

      const data = await response.json();

      console.log("Response:");
      console.log(data);
      console.log("==============================");

      return data;
    } catch (err) {
      console.error("[AutoWeather] Error calling /today/create");
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    console.log("Location object:", location);

    if (location && location.latitude && location.longitude) {
      const fetchWeather = async () => {
        try {
          console.log("Location acquired:");
          console.log(location.latitude, location.longitude);

          const cached = localStorage.getItem(STORAGE_KEY);

          if (cached) {
            const parsed = JSON.parse(cached);

            console.log("Cached weather:", parsed);

            if (parsed.date && isToday(parsed.date)) {
              console.log("Using cached weather.");

              setWeather(parsed.weather);

              await triggerCreateToday(
                parsed.weather.min,
                parsed.weather.max,
                getSeason()
              );

              return;
            }

            console.log("Cache is outdated.");
          }

          console.log("Fetching weather from Open Meteo...");

          const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
            `&longitude=${location.longitude}` +
            `&daily=temperature_2m_max,temperature_2m_min` +
            `&timezone=auto`;

          const response = await fetch(url);

          console.log("Weather API status:", response.status);

          const data = await response.json();

          console.log("Weather API response:");
          console.log(data);

          if (data && data.daily) {
            const weatherData = {
              min: data.daily.temperature_2m_min[0],
              max: data.daily.temperature_2m_max[0],
            };

            console.log("Today's weather:");
            console.log(weatherData);

            setWeather(weatherData);

            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                date: new Date().toISOString(),
                weather: weatherData,
              })
            );

            console.log("Weather cached.");

            await triggerCreateToday(
              weatherData.min,
              weatherData.max,
              getSeason()
            );
          }
        } catch (err) {
          console.error("Weather fetch failed:");
          console.error(err);

          setError("Failed to fetch weather data.");
        }
      };

      fetchWeather();
    }
  }, [location]);

  return (
    <div className="weather">
      {location.loading && (
        <p className="weather-text">
          Loading location... (please enable location permissions)
        </p>
      )}

      {location.error && (
        <p className="weather-error">
          Unable to access location: {location.error.message}
        </p>
      )}

      {weather ? (
        <>
          <p className="weather-text">
            {getSeason().charAt(0).toUpperCase() + getSeason().slice(1)}
          </p>

          <p className="weather-text">
            {weather.min}°C - {weather.max}°C
          </p>
        </>
      ) : (
        !error && <p className="weather-text">Loading weather...</p>
      )}

      {error && <p className="weather-error">{error}</p>}
    </div>
  );
};

export default AutoWeather;