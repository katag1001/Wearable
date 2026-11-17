const test = require("node:test");
const assert = require("node:assert/strict");

const { localParts, addDays, isDaytime } = require("../services/weather/localTime.js");
const { wmoCodeFor, mostSignificantCode, UNKNOWN_SYMBOL_CODE } = require("../services/weather/weatherSymbols.js");
const { seriesFromForecast, forecastDaysFrom } = require("../services/weather/forecastDays.js");
const { daytimeRangesFromHourly, typicalTableFrom } = require("../services/weather/typicalTable.js");
const { readWeatherQuery, areaFor } = require("../services/weather/weatherRequest.js");
const { metUserAgent } = require("../services/weather/weatherSources.js");

const DAYTIME = { start: "07:30", end: "22:30" };

/* -------------------- Local time -------------------- */

test("UTC instants become the zone's local date and time", () => {
  const instant = new Date("2026-07-01T23:30:00Z");

  assert.deepEqual(localParts(instant, { tz: "Europe/London" }), { date: "2026-07-02", time: "00:30" });
  assert.deepEqual(localParts(instant, { tz: "America/New_York" }), { date: "2026-07-01", time: "19:30" });
});

test("without a known time zone the offset is used", () => {
  const instant = new Date("2026-07-01T23:30:00Z");

  assert.deepEqual(localParts(instant, { tz: "Not/AZone", offsetMinutes: 60 }), { date: "2026-07-02", time: "00:30" });
  assert.deepEqual(localParts(instant, {}), { date: "2026-07-01", time: "23:30" });
});

test("days and the daytime window", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(isDaytime("07:30", DAYTIME), true);
  assert.equal(isDaytime("22:30", DAYTIME), true);
  assert.equal(isDaytime("06:00", DAYTIME), false);
  assert.equal(isDaytime("23:00", DAYTIME), false);
});

/* -------------------- Weather symbols -------------------- */

test("MET Norway symbols become WMO codes", () => {
  assert.equal(wmoCodeFor("clearsky_day"), 0);
  assert.equal(wmoCodeFor("partlycloudy_night"), 2);
  assert.equal(wmoCodeFor("cloudy"), 3);
  assert.equal(wmoCodeFor("fog"), 45);
  assert.equal(wmoCodeFor("heavyrain"), 65);
  assert.equal(wmoCodeFor("lightsnowshowers_polartwilight"), 85);
  assert.equal(wmoCodeFor("rainshowersandthunder_day"), 95);
  assert.equal(wmoCodeFor("lightssleetshowersandthunder_day"), 95);
});

test("unknown or missing symbols give no code", () => {
  assert.equal(wmoCodeFor("meteorshower_day"), null);
  assert.equal(wmoCodeFor(""), null);
  assert.equal(wmoCodeFor(undefined), null);
});

test("the day's most telling code wins: storms > snow > rain > showers > fog > cloud > sun", () => {
  assert.equal(mostSignificantCode([0, 0, 63, 2]), 63);
  assert.equal(mostSignificantCode([81, 63]), 63);
  assert.equal(mostSignificantCode([63, 73]), 73);
  assert.equal(mostSignificantCode([73, 95]), 95);
  assert.equal(mostSignificantCode([0, 3, 1]), 3);
  assert.equal(mostSignificantCode([61, 65]), 65);
  assert.equal(mostSignificantCode([]), null);
});

/* -------------------- Forecast days -------------------- */

const entry = (time, temp, symbol) => ({
  time,
  data: { instant: { details: { air_temperature: temp } }, next_1_hours: { summary: { symbol_code: symbol } } },
});

test("the forecast response is reduced to time, temperature and symbol", () => {
  const body = {
    properties: {
      timeseries: [
        entry("2026-07-01T10:00:00Z", 18.4, "rain"),
        { time: "2026-07-07T12:00:00Z", data: { instant: { details: { air_temperature: 20 } }, next_6_hours: { summary: { symbol_code: "fair_day" } } } },
        { time: "2026-07-08T12:00:00Z", data: { instant: { details: {} } } },
      ],
    },
  };

  assert.deepEqual(seriesFromForecast(body), [
    { time: "2026-07-01T10:00:00Z", temp: 18.4, symbol: "rain" },
    { time: "2026-07-07T12:00:00Z", temp: 20, symbol: "fair_day" },
  ]);
  assert.deepEqual(seriesFromForecast(null), []);
});

test("days use daytime temperatures and the most telling daytime weather", () => {
  const series = seriesFromForecast({
    properties: {
      timeseries: [
        entry("2026-07-01T03:00:00Z", 9, "heavysnow"), // 04:00 London: night, ignored
        entry("2026-07-01T08:00:00Z", 14, "clearsky_day"),
        entry("2026-07-01T13:00:00Z", 21.26, "lightrain"),
        entry("2026-07-01T20:00:00Z", 16, "partlycloudy_day"),
        entry("2026-07-02T12:00:00Z", 19, "fair_day"),
      ],
    },
  });

  const { days } = forecastDaysFrom(series, {
    zone: { tz: "Europe/London" },
    now: new Date("2026-07-01T06:00:00Z"),
    dayCount: 8,
    daytime: DAYTIME,
  });

  assert.deepEqual(days["2026-07-01"], { min: 14, max: 21.3, code: 61 });
  assert.deepEqual(days["2026-07-02"], { min: 19, max: 19, code: 1 });
  assert.equal(Object.keys(days).length, 2);
});

test("a day with only night readings uses the whole day", () => {
  const series = [{ time: "2026-07-05T00:00:00Z", temp: 12, symbol: "cloudy" }];

  const { days } = forecastDaysFrom(series, {
    zone: { offsetMinutes: 0 },
    now: new Date("2026-07-01T06:00:00Z"),
    dayCount: 8,
    daytime: DAYTIME,
  });

  assert.deepEqual(days["2026-07-05"], { min: 12, max: 12, code: 3 });
});

test("days before today or past the window are left out; unknown symbols are reported", () => {
  const series = [
    { time: "2026-06-30T12:00:00Z", temp: 30, symbol: "clearsky_day" },
    { time: "2026-07-01T12:00:00Z", temp: 20, symbol: "mystery_day" },
    { time: "2026-07-09T12:00:00Z", temp: 25, symbol: "clearsky_day" },
  ];

  const { days, unknownSymbols } = forecastDaysFrom(series, {
    zone: { offsetMinutes: 0 },
    now: new Date("2026-07-01T06:00:00Z"),
    dayCount: 8,
    daytime: DAYTIME,
  });

  assert.deepEqual(Object.keys(days), ["2026-07-01"]);
  assert.equal(days["2026-07-01"].code, UNKNOWN_SYMBOL_CODE);
  assert.deepEqual(unknownSymbols, ["mystery_day"]);
});

/* -------------------- Typical weather -------------------- */

test("hourly history becomes daytime ranges per local day, skipping missing readings", () => {
  const ranges = daytimeRangesFromHourly(
    {
      2026070103: 8, // 04:00 London: night
      2026070109: 15,
      2026070114: 22,
      2026070116: -999, // missing
      2026070210: 17,
    },
    { tz: "Europe/London" },
    DAYTIME
  );

  assert.deepEqual(ranges, {
    "2026-07-01": { min: 15, max: 22 },
    "2026-07-02": { min: 17, max: 17 },
  });
});

test("the typical table averages each day of the year over the years", () => {
  const table = typicalTableFrom(
    {
      "2024-03-10": { min: 4, max: 10 },
      "2025-03-10": { min: 6, max: 12 },
    },
    0
  );

  assert.deepEqual(table["03-10"], { min: 5, max: 11 });
  assert.equal(table["03-11"], undefined);
});

test("smoothing spreads a day over its neighbours, round the year end", () => {
  const table = typicalTableFrom({ "2025-12-31": { min: 2, max: 6 } }, 1);

  assert.deepEqual(table["01-01"], { min: 2, max: 6 });
  assert.deepEqual(table["12-30"], { min: 2, max: 6 });
  assert.equal(table["01-02"], undefined);
});

/* -------------------- Requests -------------------- */

test("a weather request needs a valid location; the zone falls back to the offset", () => {
  assert.deepEqual(readWeatherQuery({ lat: "51.507", lon: "-0.128", tz: "Europe/London", offset: "60" }), {
    latitude: 51.507,
    longitude: -0.128,
    zone: { tz: "Europe/London", offsetMinutes: 60 },
  });
  assert.deepEqual(readWeatherQuery({ lat: "51", lon: "0", tz: "Nowhere/Land", offset: "abc" }).zone, { offsetMinutes: 0 });
  assert.equal(readWeatherQuery({ lat: "91", lon: "0" }), null);
  assert.equal(readWeatherQuery({ lat: "51" }), null);
  assert.equal(readWeatherQuery({ lat: "", lon: "" }), null);
});

test("locations round to a shared area, never more than 4 decimals", () => {
  assert.deepEqual(areaFor(51.5072, -0.1276, 0.1, "forecast"), { latitude: 51.5, longitude: -0.1, key: "forecast:51.5,-0.1" });
  assert.deepEqual(areaFor(40.7128, -74.006, 0.5, "typical"), { latitude: 40.5, longitude: -74, key: "typical:40.5,-74" });
  assert.equal(areaFor(-0.04, 0.04, 0.1, "x").key, "x:0,0");
});

test("MET Norway is only called with a real contact", () => {
  assert.equal(metUserAgent("someone@example.com"), "LovedWornSeen/1.0 someone@example.com");
  assert.throws(() => metUserAgent(""));
  assert.throws(() => metUserAgent(undefined));
});
