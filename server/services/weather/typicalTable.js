// server/services/weather/typicalTable.js
//
// The typical weather for each day of the year - the Plan tab's estimate
// for days past the forecast (context/planning-feature.md) - from NASA
// POWER's hourly temperatures over the last few years.
//
// Hourly, not daily, so each day's min / max is over the same daytime
// window as Today's (shared/daytimeHours.json) - a daily minimum would be a
// night-time one. Averaged per day of the year, then smoothed over
// SMOOTHING_DAYS either side. Result: { "MM-DD": { min, max } }, 366 days.
// Pure - no I/O.

const { isDaytime, localParts } = require("./localTime.js");

const DAY_MS = 24 * 60 * 60 * 1000;

const isoDate = (date) => date.toISOString().slice(0, 10);
const oneDecimal = (value) => Math.round(value * 10) / 10;
const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

// Every "MM-DD" of a leap year, in order.
const YEAR_DAYS = Array.from({ length: 366 }, (_, index) =>
  isoDate(new Date(Date.UTC(2024, 0, 1) + index * DAY_MS)).slice(5)
);

// NASA POWER marks missing readings with this.
const POWER_FILL_VALUE = -999;

// { "YYYY-MM-DD": { min, max } } - each local day's daytime min / max from
// NASA POWER hourly readings ({ "YYYYMMDDHH": temperature }, UTC).
const daytimeRangesFromHourly = (hourly, zone, daytime) => {
  const ranges = {};

  Object.entries(hourly || {}).forEach(([key, temperature]) => {
    if (typeof temperature !== "number" || temperature <= POWER_FILL_VALUE || key.length !== 10) return;

    const instant = new Date(
      Date.UTC(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)), Number(key.slice(8, 10)))
    );
    const local = localParts(instant, zone);

    if (!isDaytime(local.time, daytime)) return;

    const range = ranges[local.date];

    ranges[local.date] = range
      ? { min: Math.min(range.min, temperature), max: Math.max(range.max, temperature) }
      : { min: temperature, max: temperature };
  });

  return ranges;
};

// { "MM-DD": { min, max } } from daily ranges ({ "YYYY-MM-DD": { min, max } },
// several years): each day of the year averaged over the years, then over
// `smoothingDays` either side (wrapping round the year).
const typicalTableFrom = (dailyRanges, smoothingDays) => {
  const byDay = new Map(YEAR_DAYS.map((day) => [day, { mins: [], maxes: [] }]));

  Object.entries(dailyRanges).forEach(([date, range]) => {
    const day = byDay.get(date.slice(5));

    if (day) {
      day.mins.push(range.min);
      day.maxes.push(range.max);
    }
  });

  const table = {};

  YEAR_DAYS.forEach((day, index) => {
    const mins = [];
    const maxes = [];

    for (let offset = -smoothingDays; offset <= smoothingDays; offset += 1) {
      const near = byDay.get(YEAR_DAYS[(index + offset + YEAR_DAYS.length) % YEAR_DAYS.length]);

      mins.push(...near.mins);
      maxes.push(...near.maxes);
    }

    if (mins.length) {
      table[day] = { min: oneDecimal(average(mins)), max: oneDecimal(average(maxes)) };
    }
  });

  return table;
};

module.exports = { daytimeRangesFromHourly, typicalTableFrom, POWER_FILL_VALUE };
