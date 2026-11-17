// server/services/weather/weatherSymbols.js
//
// MET Norway describes the weather with symbol names ("rain",
// "partlycloudy_day", "heavysnowshowersandthunder_night"); the apps use
// WMO weather code numbers (core/weather/weatherCodes.js: the outfit
// temperature nudge and the icon). This turns one into the other, and
// picks the day's most telling code. Pure - no I/O.

// Symbol name (without _day / _night / _polartwilight) -> WMO code.
const WMO_BY_SYMBOL = {
  clearsky: 0,
  fair: 1,
  partlycloudy: 2,
  cloudy: 3,
  fog: 45,

  lightrain: 61,
  rain: 63,
  heavyrain: 65,
  lightsleet: 66,
  sleet: 67,
  heavysleet: 67,
  lightsnow: 71,
  snow: 73,
  heavysnow: 75,

  lightrainshowers: 80,
  rainshowers: 81,
  heavyrainshowers: 82,
  lightsleetshowers: 80,
  sleetshowers: 81,
  heavysleetshowers: 82,
  lightsnowshowers: 85,
  snowshowers: 85,
  heavysnowshowers: 86,
};

const THUNDER = 95;

// Used for a symbol we don't know (and logged): cloudy, no nudge.
const UNKNOWN_SYMBOL_CODE = 3;

// The WMO code for a MET Norway symbol, or null if it isn't one we know.
const wmoCodeFor = (symbol) => {
  if (typeof symbol !== "string" || !symbol) return null;

  const name = symbol.split("_")[0];

  // Every "...andthunder" symbol (MET Norway's names include a few
  // misspelt ones, e.g. "lightssleetshowersandthunder").
  if (name.includes("thunder")) return THUNDER;

  return Object.prototype.hasOwnProperty.call(WMO_BY_SYMBOL, name) ? WMO_BY_SYMBOL[name] : null;
};

// How much a code says about the day: storms over snow over rain over
// showers over fog over cloud over sun, then the heavier within each.
const KIND_RANK = (code) => {
  if (code >= 95) return 6;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 5;
  if (code >= 61 && code <= 67) return 4;
  if (code >= 80 && code <= 82) return 3;
  if (code === 45 || code === 48) return 2;
  if (code >= 1 && code <= 3) return 1;
  return 0;
};

const significance = (code) => KIND_RANK(code) * 100 + code;

// The most telling of the day's codes (so a rainy afternoon isn't hidden
// by a sunny morning), or null if there are none.
const mostSignificantCode = (codes) =>
  codes
    .filter((code) => typeof code === "number")
    .reduce((best, code) => (best === null || significance(code) > significance(best) ? code : best), null);

module.exports = { wmoCodeFor, mostSignificantCode, UNKNOWN_SYMBOL_CODE };
