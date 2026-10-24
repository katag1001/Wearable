// core/constants/footwearColour.js
//
// How a shoe's colours and pattern move it up or down the Today page's shoe
// box for the outfit worn today (core/footwear/footwearRanking.js). Uses
// the user's colour level (Preferences.colour) and the same palettes and
// colour caps as outfits (shared/colorPalettes.json). Every colour on the
// shoe counts.

// Up to this many outfit colours (before the shoes), a shoe that adds a
// colour is preferred; above it, a shoe that reuses the outfit's colours.
export const ADD_COLOUR_UP_TO = {
  min: 3,
  mid: 3,
  max: 4,
};

// "fits" = outfit + shoe colours fit one of the level's palettes and stay
// within its colour cap. An outfit that itself fits no palette (e.g. one the
// user built) skips the palette part and is judged on the cap only.
export const COLOUR_POINTS = {
  addColour: {
    newColourFits: 15,
    outfitColoursOnly: 5,
    doesNotFit: -10,
  },
  matchColours: {
    outfitColoursOnly: 15,
    newColourFits: 0,
    doesNotFit: -10,
  },
};

// An outfit with an outer and from this many colours up to its level's
// ADD_COLOUR_UP_TO (before the shoes) prefers shoes in the outer's colours
// (any colour of any outer, against any colour on the shoe) instead of
// the addColour points. Outfit matching is unaffected - this is shoes only.
export const OUTER_COLOUR_FROM = 2;

export const OUTER_COLOUR_POINTS = {
  outerColour: 15,
  outfitColoursOnly: 5,
  newColourFits: 0,
  doesNotFit: -20,
};

// When no shoe fits the outfit's colours at all, these colours are
// preferred instead (a shoe with several takes the best). Any other
// colour gets no colour preference.
export const FALLBACK_COLOUR_POINTS = {
  Black: 15,
  White: 10,
  Brown: 5,
};

// Patterned shoes: a boost with a plain outfit; with a patterned outfit,
// a penalty that depends on the colour level.
export const PATTERN_POINTS = {
  plainOutfit: 10,
  patternedOutfit: {
    min: -20,
    mid: -5,
    max: 0,
  },
};
