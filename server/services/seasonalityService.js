// server/services/seasonalityService.js
//
// Which seasons an outfit belongs to, from its fabrics, colours, types and
// temperature range (constants/seasonality.js). Pure - no DB access.
//
//  - seasonalPoints: Today's extra points for an outfit in today's season
//    (fabric and palette), by the user's seasonality level. Never saved.
//  - outfitSeasonFlags: the outfit's spring/summer/autumn/winter flags,
//    saved on the match for the Outfits page season buttons and filter.

const FABRIC_LIST = require("../../shared/fabrics.json");
const {
  SEASONS,
  SEASONALITY_POINTS,
  DEFAULT_SEASONALITY,
  SEASON_TEMPERATURE_BANDS,
  SEASON_NAMED_SUBTYPES,
} = require("../constants/seasonality.js");
const { paletteFits } = require("../utils/colorPalettes.js");

const FABRICS = FABRIC_LIST.map(({ name }) => name);
const FABRIC_SEASONS = new Map(FABRIC_LIST.map(({ name, seasons }) => [name, seasons]));

// The seasons an item's fabric belongs to; [] = any time (or no fabric yet).
const fabricSeasonsOf = (item) => FABRIC_SEASONS.get(item?.fabric) || [];

const belongsTo = (seasons, season) => seasons.length > 0 && seasons.includes(season);
const belongsElsewhere = (seasons, season) => seasons.length > 0 && !seasons.includes(season);

const pointsFor = (level) => SEASONALITY_POINTS[level] ?? SEASONALITY_POINTS[DEFAULT_SEASONALITY];

// The palettes (of the user's level) the outfit's colours fit.
const fittingPalettes = (colours, palettes) =>
  colours.length ? palettes.filter((palette) => paletteFits(palette, colours)) : [];

/* -------------------- Today's points -------------------- */

// +points if any item's fabric belongs to the season, -points if any
// belongs only to other seasons; both cancel out. Once per outfit.
function fabricPoints(items, season, points) {
  const seasons = items.map(fabricSeasonsOf);
  const inSeason = seasons.some((list) => belongsTo(list, season));
  const outOfSeason = seasons.some((list) => belongsElsewhere(list, season));

  return (inSeason ? points : 0) - (outOfSeason ? points : 0);
}

// +points if the colours fit a palette of the season. No penalty.
function palettePoints(colours, palettes, season, points) {
  return fittingPalettes(colours, palettes).some((palette) => belongsTo(palette.seasons || [], season))
    ? points
    : 0;
}

// { fabric, palette } points for an outfit today. `level` is
// Preferences.seasonality; `palettes` the user's level's palettes.
function seasonalPoints({ items, colours, palettes, season, level }) {
  const points = pointsFor(level);

  if (!points || !SEASONS.includes(season)) {
    return { fabric: 0, palette: 0 };
  }

  return {
    fabric: fabricPoints(items, season, points),
    palette: palettePoints(colours, palettes, season, points),
  };
}

/* -------------------- Season flags -------------------- */

const overlapsBand = ({ min_temp, max_temp }, { min, max }) =>
  (min === null || max_temp >= min) && (max === null || min_temp <= max);

// True unless something ties the outfit to other seasons: a fabric or a
// season-named type belonging elsewhere, colours that only fit other
// seasons' palettes, or a temperature range outside the season's band.
function fitsSeason({ items, colours, palettes, range }, season) {
  const tiedElsewhere = items.some(
    (item) =>
      belongsElsewhere(fabricSeasonsOf(item), season) ||
      belongsElsewhere(SEASON_NAMED_SUBTYPES[item.subtype] || [], season)
  );

  const fitting = fittingPalettes(colours, palettes);
  const coloursElsewhere =
    fitting.length > 0 && fitting.every((palette) => belongsElsewhere(palette.seasons || [], season));

  return !tiedElsewhere && !coloursElsewhere && overlapsBand(range, SEASON_TEMPERATURE_BANDS[season]);
}

// { spring, summer, autumn, winter } for an outfit. `range` is its
// { min_temp, max_temp }.
function outfitSeasonFlags({ items, colours, palettes, range }) {
  return Object.fromEntries(
    SEASONS.map((season) => [season, fitsSeason({ items, colours, palettes, range }, season)])
  );
}

module.exports = {
  FABRICS,
  fabricSeasonsOf,
  seasonalPoints,
  outfitSeasonFlags,
};
