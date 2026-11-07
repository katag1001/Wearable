// core/outfitRebuild/runOutfitRebuild.js
//
// Carries out the outfit rebuild a preference change started
// (server/services/outfitRebuildService.js): asks the server for one chunk
// after another until it's done, then today's list is built again from
// today's cached weather and the tag picked for today. If the app closes
// or the network drops part-way, the server keeps its place, so the next
// run carries on from there.

import { continueOutfitRebuild } from "../api/preferences.js";
import { todayWeatherParams } from "../today/createTodayOnce.js";
import { getCachedToday } from "../today/todayCache.js";
import { getSeason, getTodayDayOfWeek } from "../utils/dates.js";
import { getTodayWeatherEntry } from "../weather/weatherCache.js";

// A failed chunk is tried again this many times, this far apart, before
// giving up until the next run.
const RETRIES = 3;
const RETRY_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Today's weather (as /today/create takes it), weekday and picked tag - or
// null without a forecast for today.
const todayParams = () => {
  const entry = getTodayWeatherEntry();

  if (!entry) return null;

  return {
    ...todayWeatherParams(entry.weather, getSeason(new Date(), entry.location?.latitude)),
    dayOfWeek: getTodayDayOfWeek(),
    tag: getCachedToday()?.pickedTag ?? null,
  };
};

// `refreshToday`: build today's list again even with no rebuild to carry
// out (a change only Today reads). `onProgress({ remaining, total })` after
// each chunk. Resolves { finished, todayRebuilt } - finished false when it
// gave up (it carries on next time).
export const runOutfitRebuild = async ({ refreshToday = false, onProgress } = {}) => {
  let failures = 0;

  for (;;) {
    try {
      const result = await continueOutfitRebuild({ refreshToday, today: todayParams() });

      failures = 0;

      if (!result.running) {
        return { finished: true, todayRebuilt: Boolean(result.todayRebuilt) };
      }

      onProgress?.({ remaining: result.remaining, total: result.total });
    } catch (err) {
      console.error("Outfit rebuild chunk failed:", err);

      failures += 1;

      if (failures > RETRIES) {
        return { finished: false, todayRebuilt: false };
      }

      await wait(RETRY_MS);
    }
  }
};
