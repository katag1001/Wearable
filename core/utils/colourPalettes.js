// core/utils/colourPalettes.js
//
// The colour palettes (shared/colorPalettes.json - the server reads the same
// file, server/utils/colorPalettes.js) for the browser and the mobile app:
// the palettes at a colour level, and the favourite colour families picked
// on the style quiz and Style Preferences.

import colorPalettes from "../../shared/colorPalettes.json";
import { colorOptions } from "../constants/optionsBank.js";

const hexByName = Object.fromEntries(colorOptions.map((option) => [option.name, option.value]));

// A known colour level, or the default one.
export const resolveColourLevel = (level) =>
  level in colorPalettes.maxColors ? level : colorPalettes.defaultLevel;

export const palettesForLevel = (level) => {
  const resolved = resolveColourLevel(level);

  return colorPalettes.palettes.filter((palette) => palette.levels.includes(resolved));
};

// The swatch colour for a colour name.
export const colourHex = (name) => hexByName[name] || "#cccccc";

// The colour families the user picks favourites from (style quiz and
// Style Preferences) - the same at every colour level. Outfits in picked
// families score higher on Today (server/utils/colorPalettes.js).
export const colourFamilies = colorPalettes.colourFamilies;

export const MAX_FAVOURITE_COLOUR_FAMILIES = 3;

// Picks or unpicks a family. A pick past the max is ignored - unpick one
// first.
export const toggleColourFamily = (picked, id) => {
  if (picked.includes(id)) {
    return picked.filter((pickedId) => pickedId !== id);
  }

  return picked.length < MAX_FAVOURITE_COLOUR_FAMILIES ? [...picked, id] : picked;
};

