// core/today/createTodayOnce.js
//
// Asks the server to build today's outfit list, at most once a day.

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { createToday } from "../api/today.js";
import { getTodayStartISO, isDateToday } from "../utils/dates.js";
import { getWeatherTempOffset } from "../weather/weatherCodes.js";

// Outfits are matched against the forecast shifted by the weather offset;
// the real forecast is what gets cached and displayed. Failures are
// logged, not thrown, and are retried on the next call.
export const createTodayOnce = async (weather, season) => {
  const storage = getStorage();
  const alreadyCreated = storage.getItem(STORAGE_KEYS.todayCreated);

  if (alreadyCreated && isDateToday(alreadyCreated)) {
    console.log("Today already created.");
    return;
  }

  const offset = getWeatherTempOffset(weather.code);

  try {
    const data = await createToday({
      minTemp: weather.min + offset,
      maxTemp: weather.max + offset,
      season,
      todayStart: getTodayStartISO(),
    });

    console.log("Created today:", data);

    storage.setItem(STORAGE_KEYS.todayCreated, new Date().toISOString());

    return data;

  } catch (err) {
    console.error("Error creating today:", err);
  }
};
