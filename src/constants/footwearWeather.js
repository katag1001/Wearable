// src/constants/footwearWeather.js
//
// How today's weather moves footwear up or down the Today page's shoe box
// (src/components/today/footwear/footwearRanking.js). Each rule that
// applies adds its points to the shoe's score; several can apply at once
// (e.g. a cold, snowy day). Weather never hides a shoe.
//
// `when` reads today's forecast { min, max, code } - code is the WMO
// weather code (see getWeatherEmoji in todayHelpers.jsx).

const BOOTS = [
  "Ankle boots",
  "Knee-high boots",
  "Heeled boots",
  "Snow boots",
  "Walking boots",
  "Boots",
];

const isSnow = (code) =>
  (code >= 71 && code <= 77) || code === 85 || code === 86;

// Drizzle, rain, freezing rain, showers and thunderstorms.
const isRain = (code) =>
  (code >= 51 && code <= 67) ||
  (code >= 80 && code <= 82) ||
  code >= 95;

export const HOT_DAY_MAX = 22;
export const COLD_DAY_MAX = 10;

export const FOOTWEAR_WEATHER_RULES = [
  {
    name: "snow",
    when: ({ code }) => isSnow(code),
    points: {
      "Snow boots": 20,
      ...Object.fromEntries(
        BOOTS.filter((boot) => boot !== "Snow boots").map((boot) => [boot, 10])
      ),
      "Sandals": -20,
      "Heeled sandals": -20,
      "Flipflops": -20,
      "Ballerinas": -20,
      "Heels": -20,
    },
  },
  {
    name: "rain",
    when: ({ code }) => isRain(code),
    points: {
      ...Object.fromEntries(BOOTS.map((boot) => [boot, 10])),
      "Smart trainers": 5,
      "Casual trainers": 5,
      "Sandals": -15,
      "Heeled sandals": -15,
      "Flipflops": -15,
      "Ballerinas": -15,
    },
  },
  {
    name: "hot",
    when: ({ max }) => max >= HOT_DAY_MAX,
    points: {
      "Sandals": 10,
      "Heeled sandals": 10,
      "Flipflops": 10,
      "Snow boots": -15,
      "Knee-high boots": -15,
    },
  },
  {
    name: "cold",
    when: ({ max }) => max <= COLD_DAY_MAX,
    points: {
      ...Object.fromEntries(BOOTS.map((boot) => [boot, 10])),
      "Sandals": -15,
      "Heeled sandals": -15,
      "Flipflops": -15,
      "Ballerinas": -5,
    },
  },
];
