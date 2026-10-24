// core/constants/footwearTights.js
//
// How wearing an outfit with tights (the Today entry's `withTights`) moves
// footwear up or down the Today page's shoe box
// (core/footwear/footwearRanking.js). Boots are pushed well above
// trainers; open shoes go to the bottom group, like shoes the weather
// rules out, so no score can lift them above the rest.

export const TIGHTS_POINTS = {
  "Ankle boots": 25,
  "Knee-high boots": 25,
  "Heeled boots": 25,
  "Boots": 25,
  "Snow boots": 10,
  "Walking boots": 10,
  "Smart trainers": -15,
  "Casual trainers": -15,
};

export const NOT_WITH_TIGHTS = ["Sandals", "Heeled sandals", "Flipflops"];
