import React, { useEffect } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import "./autoWeather.css";
import { useWeather } from "@core/hooks/useWeather.js";
import { formatWeatherLine } from "@core/weather/weatherText.js";


// The weather line on Today. The logic is useWeather (shared with the
// mobile app); this passes in the browser's location and renders it.
const AutoWeather = ({ setTodayReady }) => {
  const location = useGeolocation();

  const { weather, season, isFallback, error, ready } = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
    locationUnavailable: Boolean(location.error),
  });

  useEffect(() => {
    if (ready) {
      setTodayReady(true);
    }
  }, [ready, setTodayReady]);


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
          {formatWeatherLine({ weather, season })}
          {isFallback && " (last known weather)"}
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
