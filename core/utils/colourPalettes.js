// core/utils/colourPalettes.js
//
// The colour palettes (shared/colorPalettes.json - the server reads the same
// file, server/utils/colorPalettes.js) for the browser and the mobile app:
// the palettes at a colour level, and the favourite-palette picker on the
// style quiz and Style Preferences.

import colorPalettes from "../../shared/colorPalettes.json";
import { colorOptions } from "../constants/optionsBank.js";

const TIER_ORDER = ["classic", "common", "bold"];

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

// Palettes to offer as favourites: the user's level's palettes, plus any
// palette from another level they've already picked (so it can be
// unpicked), classic first.
export const favouritePaletteOptions = (level, favouritePalettes = []) => {
  const levelPalettes = palettesForLevel(level);
  const pickedElsewhere = colorPalettes.palettes.filter(
    (palette) => favouritePalettes.includes(palette.id) && !levelPalettes.includes(palette)
  );

  return [...levelPalettes, ...pickedElsewhere].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );
};

export const toggleFavouritePalette = (favouritePalettes, id) =>
  favouritePalettes.includes(id)
    ? favouritePalettes.filter((favouriteId) => favouriteId !== id)
    : [...favouritePalettes, id];
