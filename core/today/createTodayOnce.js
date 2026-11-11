// core/today/createTodayOnce.js
//
// Asks the server to build today's outfit list. Sent on every load: the
// server builds it only once a day (and answers "already built" straight
// away after that), so every device gets the same list - and if the list
// is cleared on the server (server/scripts/resetToday.js), the next load
// builds a new one from this device's weather (core/api/today.js).
// Today's plan (Plan tab) is worn by the server on the way; its undo values
// are kept for the Today page (core/plan/plannedWorn.js).

import { createToday } from "../api/today.js";
import { savePlannedWorn } from "../plan/plannedWorn.js";
import {
  getTodayDate,
  getTodayDayOfWeek,
  getTodayStartISO,
} from "../utils/dates.js";
import { getWeatherTempOffset } from "../weather/weatherCodes.js";

// Outfits are matched against the forecast shifted by the weather offset;
// the real forecast is what gets cached and displayed. Failures are
// logged, not thrown, and are retried on the next call.
// A request already on its way - start-up can ask more than once.
let pending = null;

export const createTodayOnce = (weather, season) => {
  if (!pending) {
    pending = sendCreateToday(weather, season).finally(() => {
      pending = null;
    });
  }

  return pending;
};

// The day's weather as the server builds today's list from it (also for
// picking another tag - api/today.js changeTodayTag).
export const todayWeatherParams = (weather, season) => {
  const offset = getWeatherTempOffset(weather.code);

  return {
    minTemp: weather.min + offset,
    maxTemp: weather.max + offset,
    season,
    todayStart: getTodayStartISO(),
  };
};

const sendCreateToday = async (weather, season) => {
  try {
    const data = await createToday({
      ...todayWeatherParams(weather, season),
      dayOfWeek: getTodayDayOfWeek(),
      todayDate: getTodayDate(),
    });

    console.log("Created today:", data);

    if (data?.plannedWorn) savePlannedWorn(data.plannedWorn);

    return data;

  } catch (err) {
    console.error("Error creating today:", err);
  }
};
