// mobile/src/platform/useLocation.js
//
// The phone's location for today's weather - the mobile version of the
// web's useGeolocation. Weather only needs a rough position, so the last
// known one is used if there is one, otherwise a fresh low-accuracy fix.
// { latitude, longitude, error }.

import { useEffect, useState } from "react";
import * as Location from "expo-location";

export const useLocation = () => {
  const [state, setState] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const update = (position) => {
      if (!cancelled && position) {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      }
    };

    const locate = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              error:
                "Location is off. Turn it on for LovedWornSeen in your phone's settings to get today's weather.",
            }));
          }
          return;
        }

        // One position only: each new one would start another weather
        // fetch (core/hooks/useWeather.js).
        const position =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          }));

        update(position);
      } catch (err) {
        console.error("Location failed:", err);

        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            error: prev.latitude ? null : "Couldn't find your location.",
          }));
        }
      }
    };

    locate();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
