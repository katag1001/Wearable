// server/services/todayScoreService.js
//
// An outfit's Today score: its saved score plus points that only count
// while today's list is chosen (services/todaySelectionService.js) - they
// are never saved:
//  - seasonal points (fabric and/or palette, counted once), by how much
//    the user dresses by season (services/seasonalityService.js);
//  - trend points for being on current trends, by how much the user
//    follows them (services/trendService.js);
//  - FAVOURITE_ITEM_BONUS if any of its items is a favourite;
//  - FAVOURITE_COLOURS_BONUS if its colours are in the user's favourite
//    colour families (utils/colorPalettes.js fitsFavouriteColours).
// Pure - no DB access. todayScoreBreakdown gives the parts (shown on the
// web Today page only, to see how scores are being moved).

const {
  FAVOURITE_ITEM_BONUS,
  FAVOURITE_COLOURS_BONUS,
} = require("../constants/todayOutfits.js");
const { seasonalPoints } = require("./seasonalityService.js");
const { showsTrendNote, trendPoints, trendsOn } = require("./trendService.js");
const { fitsFavouriteColours } = require("../utils/colorPalettes.js");

// `match.clothes` must be populated (subtype, colors, pattern, fabric,
// favourite).
const itemsOf = (match) => (match.clothes || []).filter(Boolean);

// `context`: { season, seasonality, palettes (the user's colour level),
// favouriteColourPalettes (favouriteFamilyPalettes of the user's favourite
// colour families), trends (the running ones), trendsLevel }.
// Returns { saved, season, trend, favouriteItem, favouriteColours, total }.
function todayScoreBreakdown(
  match,
  { season, seasonality, palettes, favouriteColourPalettes = [], trends = [], trendsLevel }
) {
  const items = itemsOf(match);
  const colours = match.colors || [];

  const parts = {
    saved: typeof match.score === "number" ? match.score : 0,
    season: seasonalPoints({ items, colours, palettes, season, level: seasonality }).total,
    trend: trendPoints(trendsOn(items, trends).length, trendsLevel),
    favouriteItem: items.some((item) => item.favourite) ? FAVOURITE_ITEM_BONUS : 0,
    favouriteColours: fitsFavouriteColours(colours, favouriteColourPalettes) ? FAVOURITE_COLOURS_BONUS : 0,
  };

  return {
    ...parts,
    total: parts.saved + parts.season + parts.trend + parts.favouriteItem + parts.favouriteColours,
  };
}

const todayScoreOf = (match, context) => todayScoreBreakdown(match, context).total;

// { label, plural } of the first trend the outfit is on, for users who
// care a lot about trends - or null.
function trendNoteOf(match, { trends = [], trendsLevel }) {
  if (!showsTrendNote(trendsLevel)) return null;

  const [trend] = trendsOn(itemsOf(match), trends);

  return trend ? { label: trend.label, plural: Boolean(trend.plural) } : null;
}

module.exports = { todayScoreOf, todayScoreBreakdown, trendNoteOf };
