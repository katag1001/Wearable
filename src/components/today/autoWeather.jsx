import React, { useEffect, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import "./autoWeather.css";
import { URL } from "../../config";

const AutoWeather = () => {
  const STORAGE_KEY = "weather_cache";
  const TODAY_KEY = "today_created";

  const location = useGeolocation();

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
    return "winter";
  };

  const getCachedWeather = () => {
    const cached = localStorage.getItem(STORAGE_KEY);

    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);

      if (parsed.date && isToday(parsed.date)) {
        return parsed;
      }

      return null;
    } catch {
      return null;
    }
  };


  const cached = getCachedWeather();

  const [weather, setWeather] = useState(
    cached ? cached.weather : null
  );

  const [error, setError] = useState(null);


  const triggerCreateToday = async (min, max, season) => {
    const alreadyCreated = localStorage.getItem(TODAY_KEY);

    if (alreadyCreated && isToday(alreadyCreated)) {
      console.log("Today already created.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

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

      const data = await response.json();

      console.log("Created today:", data);

      localStorage.setItem(
        TODAY_KEY,
        new Date().toISOString()
      );

      return data;

    } catch (err) {
      console.error("Error creating today:", err);
    }
  };


  const fetchWeather = async (latitude, longitude) => {
    try {
      console.log("Fetching new weather...");

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=auto`;

      const response = await fetch(url);

      const data = await response.json();

      if (!data.daily) return;


      const weatherData = {
        min: data.daily.temperature_2m_min[0],
        max: data.daily.temperature_2m_max[0],
      };


      setWeather(weatherData);


      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: new Date().toISOString(),

          location: {
            latitude,
            longitude,
          },

          weather: weatherData,
        })
      );


      await triggerCreateToday(
        weatherData.min,
        weatherData.max,
        getSeason()
      );


    } catch (err) {
      console.error("Weather fetch failed:", err);
      setError("Failed to fetch weather data.");
    }
  };


  useEffect(() => {

    const cached = getCachedWeather();


    // Already have today's weather
    if (cached) {

      console.log("Using cached weather.");

      triggerCreateToday(
        cached.weather.min,
        cached.weather.max,
        getSeason()
      );

      return;
    }


    // Need fresh weather
    if (
      location.latitude &&
      location.longitude
    ) {

      fetchWeather(
        location.latitude,
        location.longitude
      );

    }

  }, [
    location.latitude,
    location.longitude
  ]);



  return (
    <div className="weather">

      {location.loading && !weather && (
        <p className="weather-text">
          Loading location...
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
            {getSeason().charAt(0).toUpperCase() +
              getSeason().slice(1)}
          </p>

          <p className="weather-text">
            {weather.min}°C - {weather.max}°C
          </p>
        </>
      ) : (
        !error && (
          <p className="weather-text">
            Loading weather...
          </p>
        )
      )}


      {error && (
        <p className="weather-error">
          {error}
        </p>
      )}

    </div>
  );
};

export default AutoWeather;
