// server/services/weather/forecastDays.js
//
// MET Norway's forecast (a series of UTC times, each with a temperature
// and a weather symbol) turned into what the apps use: one entry per local
// day, { "YYYY-MM-DD": { min, max, code } } - the same shape the app has
// always used (core/weather/forecast.js).
//
// min / max are over the daytime window (shared/daytimeHours.json), the
// whole day if there are no daytime readings (MET Norway's steps get
// longer further ahead). code is the day's most telling weather. Pure.

const { addDays, isDaytime, localParts } = require("./localTime.js");
const { mostSignificantCode, UNKNOWN_SYMBOL_CODE, wmoCodeFor } = require("./weatherSymbols.js");

const oneDecimal = (value) => Math.round(value * 10) / 10;

// The useful part of a Locationforecast "compact" response:
// [{ time, temp, symbol }] - the symbol for the next hour where there is
// one, else the next 6 or 12 hours'. Entries without a temperature are
// left out.
const seriesFromForecast = (body) =>
  (body?.properties?.timeseries || [])
    .map((entry) => ({
      time: entry.time,
      temp: entry.data?.instant?.details?.air_temperature,
      symbol:
        entry.data?.next_1_hours?.summary?.symbol_code ??
        entry.data?.next_6_hours?.summary?.symbol_code ??
        entry.data?.next_12_hours?.summary?.symbol_code ??
        null,
    }))
    .filter((entry) => typeof entry.temp === "number" && typeof entry.time === "string");

// { days, unknownSymbols } - `days` from today (in the zone, at `now`) for
// `dayCount` days; days with no readings are left out.
const forecastDaysFrom = (series, { zone, now, dayCount, daytime }) => {
  const today = localParts(now, zone).date;
  const wanted = new Set(Array.from({ length: dayCount }, (_, index) => addDays(today, index)));

  const byDate = new Map();
  const unknownSymbols = new Set();

  series.forEach(({ time, temp, symbol }) => {
    const local = localParts(new Date(time), zone);

    if (!wanted.has(local.date)) return;

    let code = wmoCodeFor(symbol);
    if (code === null && symbol) {
      unknownSymbols.add(symbol);
      code = UNKNOWN_SYMBOL_CODE;
    }

    const day = byDate.get(local.date) || { all: [], daytime: [], allCodes: [], daytimeCodes: [] };
    const inDaytime = isDaytime(local.time, daytime);

    day.all.push(temp);
    if (inDaytime) day.daytime.push(temp);

    if (code !== null) {
      day.allCodes.push(code);
      if (inDaytime) day.daytimeCodes.push(code);
    }

    byDate.set(local.date, day);
  });

  const days = {};

  [...wanted].sort().forEach((date) => {
    const day = byDate.get(date);
    if (!day) return;

    const temps = day.daytime.length ? day.daytime : day.all;
    const code = mostSignificantCode(day.daytimeCodes.length ? day.daytimeCodes : day.allCodes);

    days[date] = {
      min: oneDecimal(Math.min(...temps)),
      max: oneDecimal(Math.max(...temps)),
      code,
    };
  });

  return { days, unknownSymbols: [...unknownSymbols] };
};

module.exports = { seriesFromForecast, forecastDaysFrom };
