// server/utils/colorPalettes.js
//
// Loads the colour palettes from shared/colorPalettes.json (hand-edit them
// there - the Today page's shoe box reads the same file in the browser,
// core/footwear/footwearRanking.js).
//
// Each palette is { id, tier, levels, colours }:
//  - id: stable name. Users' favourite palettes (Preferences.
//    favouritePalettes) point at it, so never change an id once it's live.
//  - tier: "classic", "common" or "bold" - how much the palette scores at
//    each colour level (PALETTE_TIER_SCORES in constants/scoring.js).
//  - levels: the Preferences.colour levels ("min"/"mid"/"max") it's used at.
//    A user is only ever checked against their own level's palettes.
//  - colours: names from colorOptions (core/constants/optionsBank.js).
//
// Each level also caps how many distinct colours a whole outfit may contain
// (maxColors; null = no cap). getColorRules() resolves the level's palettes
// and cap together, since every caller needs both.
//
// The file is checked when the server starts, and the server refuses to
// start if any palette is broken (see checkPalettes).

const colorPalettes = require("../../shared/colorPalettes.json");

const COLOUR_LEVELS = ["min", "mid", "max"];
const PALETTE_TIERS = ["classic", "common", "bold"];

// Throws a message pointing at the broken palette if the file breaks a rule.
function checkPalettes({ palettes, maxColors, defaultLevel, brightColours }) {
  const ids = new Set();

  if (!COLOUR_LEVELS.includes(defaultLevel)) {
    throw new Error(`colorPalettes.json: defaultLevel "${defaultLevel}" is not one of ${COLOUR_LEVELS.join(", ")}.`);
  }

  COLOUR_LEVELS.forEach((level) => {
    if (!(level in maxColors)) {
      throw new Error(`colorPalettes.json: maxColors is missing "${level}".`);
    }
  });

  if (!Array.isArray(brightColours)) {
    throw new Error("colorPalettes.json: brightColours must be a list of colour names.");
  }

  palettes.forEach((palette, index) => {
    const where = `colorPalettes.json palette ${palette.id || `#${index + 1}`}`;

    if (typeof palette.id !== "string" || !palette.id) {
      throw new Error(`${where} needs an id.`);
    }

    if (ids.has(palette.id)) {
      throw new Error(`${where}: the id is used twice.`);
    }

    ids.add(palette.id);

    if (!PALETTE_TIERS.includes(palette.tier)) {
      throw new Error(`${where}: tier must be one of ${PALETTE_TIERS.join(", ")}.`);
    }

    if (!Array.isArray(palette.levels) || !palette.levels.length ||
      palette.levels.some((level) => !COLOUR_LEVELS.includes(level))) {
      throw new Error(`${where}: levels must list at least one of ${COLOUR_LEVELS.join(", ")}.`);
    }

    if (!Array.isArray(palette.colours) || !palette.colours.length) {
      throw new Error(`${where} needs at least one colour.`);
    }
  });
}

checkPalettes(colorPalettes);

const allPalettes = colorPalettes.palettes;

const colorPalettesByLevel = Object.fromEntries(
  COLOUR_LEVELS.map((level) => [level, allPalettes.filter((palette) => palette.levels.includes(level))])
);

// Max number of distinct colours allowed across a whole outfit's combined
// colour set, per level - null means no cap at all.
const maxColorsByLevel = colorPalettes.maxColors;

const DEFAULT_COLOUR_LEVEL = colorPalettes.defaultLevel;

// Colours that count towards the bright-colour adjustment
// (BRIGHT_COLOUR_ADJUSTMENTS in constants/scoring.js).
const BRIGHT_COLOURS = colorPalettes.brightColours;

function paletteFits(palette, colours) {
  return colours.every((colour) => palette.colours.includes(colour));
}

// A list of favourite palette ids from the client, keeping only real ids,
// each once. Undefined (not sent) stays undefined, so a save without it
// leaves the stored favourites alone.
function cleanFavouritePalettes(ids) {
  if (ids === undefined) {
    return undefined;
  }

  const knownIds = new Set(allPalettes.map((palette) => palette.id));

  return [...new Set(Array.isArray(ids) ? ids : [])].filter((id) => knownIds.has(id));
}

// One resolved unit per level: the palette list and the colour-count cap
// together, since every caller that needs one needs the other too. `level`
// is the resolved level, which picks the level's colour scores
// (outfitScoreService.computeColourScore).
function getColorRules(level) {
  const resolvedLevel = colorPalettesByLevel[level] ? level : DEFAULT_COLOUR_LEVEL;

  return {
    palettes: colorPalettesByLevel[resolvedLevel],
    maxColors: maxColorsByLevel[resolvedLevel],
    level: resolvedLevel,
  };
}

module.exports = {
  COLOUR_LEVELS,
  PALETTE_TIERS,
  BRIGHT_COLOURS,
  allPalettes,
  colorPalettesByLevel,
  maxColorsByLevel,
  checkPalettes,
  paletteFits,
  cleanFavouritePalettes,
  getColorRules,
  DEFAULT_COLOUR_LEVEL,
};
