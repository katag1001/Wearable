// api/services/styleColorService.js
//
// Pure pattern and colour checks for a finished candidate outfit's items.
// No DB access here. These are the two checks that (along with the matrix
// clique check in matrixService) make up validateOutfit's gate for
// auto-generated candidates - never applied to user-made outfits.

// Counts items whose styles include "patterned", case-insensitively -
// addUpdateClothes.jsx stores it as "Patterned".
function passesPatternCheck(items) {
  const combinedStyles = items.flatMap((item) => item.styles || []);
  const patternedCount = combinedStyles.filter(
    (style) => typeof style === "string" && style.toLowerCase() === "patterned"
  ).length;

  return patternedCount <= 1;
}

// `colorRules` is the caller's already-resolved { palettes, maxColors } for
// their own Preferences.colour level (min/mid/max) - see
// api/utils/colorPalettes.js. An outfit must both fit within one shared
// palette AND stay within the level's distinct-colour-count cap
// (maxColors === null means no cap).
function passesColorCheck(items, colorRules) {
  const combinedColors = [...new Set(items.flatMap((item) => item.colors || []))];

  if (colorRules.maxColors !== null && combinedColors.length > colorRules.maxColors) {
    return false;
  }

  return colorRules.palettes.some((palette) =>
    combinedColors.every((color) => palette.includes(color))
  );
}

module.exports = { passesPatternCheck, passesColorCheck };
