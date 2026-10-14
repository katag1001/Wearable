import React, { useEffect, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import "./autoWeather.css";
import { URL } from "../../config";
import {
  getTodayDayOfWeek,
  getTodayStartISO,
  getSeason,
  getWeatherEmoji,
  getWeatherTempOffset,
  isDateToday,
} from "./todayHelpers";


const AutoWeather = ({ setTodayReady }) => {
  const STORAGE_KEY = "weather_cache";
  const TODAY_KEY = "today_created";

  const location = useGeolocation();


  const getCachedWeather = () => {
    const cached = localStorage.getItem(STORAGE_KEY);

    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);

      if (parsed.date && isDateToday(parsed.date)) {
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


  // Live location first, then the location stored with today's cached weather.
  const season = getSeason(
    new Date(),
    location.latitude ?? cached?.location?.latitude
  );


  // Outfits are matched against the forecast shifted by the weather offset;
  // the real forecast is what gets cached and displayed.
  const triggerCreateToday = async (
    weather,
    season
  ) => {

    const offset =
      getWeatherTempOffset(weather.code);

    const alreadyCreated =
      localStorage.getItem(TODAY_KEY);


    if (
      alreadyCreated &&
      isDateToday(alreadyCreated)
    ) {

      console.log(
        "Today already created."
      );

      return;
    }


    try {

      const token =
        localStorage.getItem("token");


      const response = await fetch(
        `${URL}/today/create`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            min_temp_today: weather.min + offset,
            max_temp_today: weather.max + offset,
            season_today: season,
            today_start: getTodayStartISO(),
          }),
        }
      );


      const data =
        await response.json();


      console.log(
        "Created today:",
        data
      );


      localStorage.setItem(
        TODAY_KEY,
        new Date().toISOString()
      );


      return data;

    } catch (err) {

      console.error(
        "Error creating today:",
        err
      );
    }
  };


  const fetchWeather = async (
    latitude,
    longitude
  ) => {

    try {

      console.log(
        "Fetching new weather..."
      );


      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto`;


      const response =
        await fetch(url);


      const data =
        await response.json();


      if (!data.daily) {
        return;
      }


      const weatherData = {
        min:
          data.daily
            .temperature_2m_min[0],

        max:
          data.daily
            .temperature_2m_max[0],

        code:
          data.daily
            .weather_code?.[0],
      };


      setWeather(
        weatherData
      );


      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date:
            new Date().toISOString(),

          location: {
            latitude,
            longitude,
          },

          weather:
            weatherData,
        })
      );


      await triggerCreateToday(
        weatherData,
        getSeason(new Date(), latitude)
      );


      setTodayReady(true);

    } catch (err) {

      console.error(
        "Weather fetch failed:",
        err
      );

      setError(
        "Failed to fetch weather data."
      );
    }
  };


  useEffect(() => {

    const cached =
      getCachedWeather();


    if (cached) {

      console.log(
        "Using cached weather."
      );


      const create =
        async () => {

          await triggerCreateToday(
            cached.weather,
            getSeason(
              new Date(),
              cached.location?.latitude
            )
          );


          setTodayReady(true);
        };


      create();

      return;
    }


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




      {location.error && (
        <p className="weather-error">
          Unable to access location:{" "}
          {location.error.message}
        </p>
      )}


      {weather ? (
        <p className="weather-text">

          {getTodayDayOfWeek()
            .charAt(0)
            .toUpperCase() +
            getTodayDayOfWeek()
              .slice(1)}

          {" · "}

          {season.charAt(0).toUpperCase() +
            season.slice(1)}

          {" · "}

          {getWeatherEmoji(weather.code) &&
            `${getWeatherEmoji(weather.code)} `}

          {weather.min}°C - {weather.max}°C

        </p>
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
