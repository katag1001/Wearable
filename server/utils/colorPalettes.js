// server/utils/colorPalettes.js
//
// Loads the colour palettes from shared/colorPalettes.json (hand-edit them
// there - the Today page's shoe box reads the same file in the browser,
// core/footwear/footwearRanking.js).
//
// Each palette is { id, tier, levels, colours, seasons }:
//  - id: stable name.
//  - tier: "classic", "common" or "bold" - how much the palette scores at
//    each colour level (PALETTE_TIER_SCORES in constants/scoring.js).
//  - levels: the Preferences.colour levels ("min"/"mid"/"max") it's used at.
//    A user is only ever checked against their own level's palettes.
//  - colours: names from colorOptions (core/constants/optionsBank.js).
//  - seasons: the seasons it belongs to ([] = any time, e.g. neutrals) -
//    for Today's seasonal points and the outfit season flags
//    (services/seasonalityService.js).
//
// Each level also caps how many distinct colours a whole outfit may contain
// (maxColors; null = no cap). getColorRules() resolves the level's palettes
// and cap together, since every caller needs both.
//
// Colour families (colourFamilies: { id, name, colours }) are what the
// user picks as favourites (Preferences.favouriteColourFamilies, up to
// MAX_FAVOURITE_COLOUR_FAMILIES). Every palette colour is either a neutral
// (neutralColours - goes with everything) or in exactly one family. A
// palette counts as a favourite only if every family in it was picked -
// its neutrals don't count (favouriteFamilyPalettes).
//
// The file is checked when the server starts, and the server refuses to
// start if any palette is broken (see checkPalettes).

const colorPalettes = require("../../shared/colorPalettes.json");

const COLOUR_LEVELS = ["min", "mid", "max"];
const SEASONS = ["spring", "summer", "autumn", "winter"];
const PALETTE_TIERS = ["classic", "common", "bold"];

// Throws a message pointing at the broken palette if the file breaks a rule.
function checkPalettes({ palettes, maxColors, defaultLevel, brightColours, neutralColours, colourFamilies }) {
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

  const familyOf = familyByColour({ neutralColours, colourFamilies });

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

    if (!Array.isArray(palette.seasons) || palette.seasons.some((season) => !SEASONS.includes(season))) {
      throw new Error(`${where}: seasons must be a list of ${SEASONS.join(", ")} (empty for any time).`);
    }

    palette.colours.forEach((colour) => {
      if (!neutralColours.includes(colour) && !familyOf.has(colour)) {
        throw new Error(`${where}: ${colour} is neither a neutral nor in a colour family.`);
      }
    });
  });
}

// colour name → its family id, checking each family has an id, a name and
// colours, and that no colour is both a neutral and in a family, or in two
// families.
function familyByColour({ neutralColours, colourFamilies }) {
  if (!Array.isArray(neutralColours)) {
    throw new Error("colorPalettes.json: neutralColours must be a list of colour names.");
  }

  if (!Array.isArray(colourFamilies) || !colourFamilies.length) {
    throw new Error("colorPalettes.json: colourFamilies must be a list of families.");
  }

  const familyOf = new Map();
  const familyIds = new Set();

  colourFamilies.forEach((family, index) => {
    const where = `colorPalettes.json colour family ${family.id || `#${index + 1}`}`;

    if (typeof family.id !== "string" || !family.id || familyIds.has(family.id)) {
      throw new Error(`${where} needs an id of its own.`);
    }

    familyIds.add(family.id);

    if (typeof family.name !== "string" || !family.name) {
      throw new Error(`${where} needs a name.`);
    }

    if (!Array.isArray(family.colours) || !family.colours.length) {
      throw new Error(`${where} needs at least one colour.`);
    }

    family.colours.forEach((colour) => {
      if (neutralColours.includes(colour) || familyOf.has(colour)) {
        throw new Error(`${where}: ${colour} is already a neutral or in another family.`);
      }

      familyOf.set(colour, family.id);
    });
  });

  return familyOf;
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

const COLOUR_FAMILIES = colorPalettes.colourFamilies;
const FAMILY_BY_COLOUR = familyByColour(colorPalettes);

// How many colour families a user can pick as favourites.
const MAX_FAVOURITE_COLOUR_FAMILIES = 3;

// The families a palette's non-neutral colours belong to.
function paletteFamilies(palette) {
  return new Set(palette.colours.map((colour) => FAMILY_BY_COLOUR.get(colour)).filter(Boolean));
}

function paletteFits(palette, colours) {
  return colours.every((colour) => palette.colours.includes(colour));
}

// The palettes (any level) every one of whose families is a favourite -
// liking one colour in a palette isn't enough.
function favouriteFamilyPalettes(familyIds = []) {
  if (!familyIds.length) return [];

  const favourites = new Set(familyIds);

  return allPalettes.filter((palette) => [...paletteFamilies(palette)].every((id) => favourites.has(id)));
}

// Whether an outfit's colours fit one of the favourite palettes
// (favouriteFamilyPalettes) and include at least one non-neutral colour -
// an all-neutral outfit isn't in anyone's favourite colours.
function fitsFavouriteColours(colours, palettes) {
  return (
    colours.some((colour) => FAMILY_BY_COLOUR.has(colour)) &&
    palettes.some((palette) => paletteFits(palette, colours))
  );
}

// A list of favourite colour family ids from the client, keeping only real
// ids, each once, at most MAX_FAVOURITE_COLOUR_FAMILIES. Undefined (not
// sent) stays undefined, so a save without it leaves the stored favourites
// alone.
function cleanFavouriteColourFamilies(ids) {
  if (ids === undefined) {
    return undefined;
  }

  const knownIds = new Set(COLOUR_FAMILIES.map((family) => family.id));

  return [...new Set(Array.isArray(ids) ? ids : [])]
    .filter((id) => knownIds.has(id))
    .slice(0, MAX_FAVOURITE_COLOUR_FAMILIES);
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
  COLOUR_FAMILIES,
  MAX_FAVOURITE_COLOUR_FAMILIES,
  allPalettes,
  colorPalettesByLevel,
  maxColorsByLevel,
  checkPalettes,
  paletteFits,
  favouriteFamilyPalettes,
  fitsFavouriteColours,
  cleanFavouriteColourFamilies,
  getColorRules,
  DEFAULT_COLOUR_LEVEL,
};
