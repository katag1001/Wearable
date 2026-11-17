// server/controllers/weatherControllers.js
//
// The weather the apps show (services/weatherService.js), fetched here so
// the phones never call the weather sources themselves.
//
//   GET /weather/forecast?lat=&lon=&tz=&offset=
//     -> { days: { "YYYY-MM-DD": { min, max, code } } }  (today + 7 days)
//   GET /weather/typical?lat=&lon=&tz=&offset=
//     -> { table: { "MM-DD": { min, max } } }  (typical weather by day of year)
//
// tz is the phone's time zone ("Europe/London"), offset its minutes east
// of UTC (used if tz is missing). 400 for a bad location, 503 (code
// "unavailable") when there's no weather to be had - the apps then use
// their own last copy.

const { readWeatherQuery } = require("../services/weather/weatherRequest.js");
const { getForecastDays, getTypicalTable } = require("../services/weatherService.js");

const UNAVAILABLE = { error: "The weather isn't available right now", code: "unavailable" };

exports.getForecast = async (req, res) => {
  const query = readWeatherQuery(req.query);

  if (!query) return res.status(400).json({ error: "Missing or invalid location" });

  try {
    const days = await getForecastDays(query);

    return res.json({ days });
  } catch (error) {
    console.error("[weather] forecast:", error.message || error);
    return res.status(503).json(UNAVAILABLE);
  }
};

exports.getTypical = async (req, res) => {
  const query = readWeatherQuery(req.query);

  if (!query) return res.status(400).json({ error: "Missing or invalid location" });

  try {
    const table = await getTypicalTable(query);

    return res.json({ table });
  } catch (error) {
    console.error("[weather] typical:", error.message || error);
    return res.status(503).json(UNAVAILABLE);
  }
};
