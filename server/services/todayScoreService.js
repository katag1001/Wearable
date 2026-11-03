// server/services/todayScoreService.js
//
// An outfit's Today score: its saved score plus points that only count
// while today's list is chosen (services/todaySelectionService.js) - they
// are never saved:
//  - seasonal fabric and palette points, by how much the user dresses by
//    season (services/seasonalityService.js);
//  - FAVOURITE_ITEM_BONUS if any of its items is a favourite;
//  - FAVOURITE_PALETTE_BONUS if its colours fit a favourite palette.
// Pure - no DB access.

const {
  FAVOURITE_ITEM_BONUS,
  FAVOURITE_PALETTE_BONUS,
} = require("../constants/todayOutfits.js");
const { seasonalPoints } = require("./seasonalityService.js");
const { allPalettes, paletteFits } = require("../utils/colorPalettes.js");

// Whether the colours fit one of the user's favourite palettes, whatever
// levels that palette is used at.
const fitsFavouritePalette = (colours, favouritePalettes = []) => {
  if (!colours.length || !favouritePalettes.length) return false;

  const favourites = new Set(favouritePalettes);

  return allPalettes.some((palette) => favourites.has(palette.id) && paletteFits(palette, colours));
};

// `match.clothes` must be populated (fabric, favourite). `context`:
// { season, seasonality, palettes (the user's colour level),
// favouritePalettes }.
function todayScoreOf(match, { season, seasonality, palettes, favouritePalettes = [] }) {
  const items = (match.clothes || []).filter(Boolean);
  const colours = match.colors || [];
  const seasonal = seasonalPoints({ items, colours, palettes, season, level: seasonality });

  return (
    (typeof match.score === "number" ? match.score : 0) +
    seasonal.fabric +
    seasonal.palette +
    (items.some((item) => item.favourite) ? FAVOURITE_ITEM_BONUS : 0) +
    (fitsFavouritePalette(colours, favouritePalettes) ? FAVOURITE_PALETTE_BONUS : 0)
  );
}

module.exports = { todayScoreOf, fitsFavouritePalette };
