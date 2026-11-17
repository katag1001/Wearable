// server/services/weather/localTime.js
//
// Weather sources give times in UTC; the apps think in the user's local
// days. A "zone" is what the phone sends: its IANA time zone ("Europe/
// London") when it knows it, and always its current offset from UTC in
// minutes as a fallback. Pure - no I/O.

const formatters = new Map();

const formatterFor = (tz) => {
  if (!formatters.has(tz)) {
    formatters.set(
      tz,
      new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
    );
  }

  return formatters.get(tz);
};

// Whether `tz` is a time zone this server knows.
const isTimeZone = (tz) => {
  if (typeof tz !== "string" || !tz || tz.length > 64) return false;

  try {
    formatterFor(tz);
    return true;
  } catch {
    return false;
  }
};

// { date: "YYYY-MM-DD", time: "HH:MM" } of the instant `date` in the zone
// ({ tz, offsetMinutes }).
const localParts = (date, zone = {}) => {
  if (zone.tz && isTimeZone(zone.tz)) {
    const parts = Object.fromEntries(
      formatterFor(zone.tz).formatToParts(date).map((part) => [part.type, part.value])
    );

    return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
  }

  const shifted = new Date(date.getTime() + (zone.offsetMinutes || 0) * 60 * 1000).toISOString();

  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
};

// "YYYY-MM-DD" `count` days after `date` ("YYYY-MM-DD").
const addDays = (date, count) => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + count);

  return next.toISOString().slice(0, 10);
};

// Whether "HH:MM" is within the daytime window (both ends included).
const isDaytime = (time, daytime) => time >= daytime.start && time <= daytime.end;

module.exports = { isTimeZone, localParts, addDays, isDaytime };
