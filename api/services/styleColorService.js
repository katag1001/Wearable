// api/services/styleColorService.js
//
// Pure pattern and colour checks for a finished candidate outfit's items.
// No DB access here. These are the two checks that (along with the matrix
// clique check in matrixService) make up validateOutfit's gate for
// auto-generated candidates - never applied to user-made outfits.

const { colorPalettes } = require("../utils/colorPalettes.js");

// Counts items whose styles include "patterned", case-insensitively -
// addUpdateClothes.jsx stores it as "Patterned".
function passesPatternCheck(items) {
  const combinedStyles = items.flatMap((item) => item.styles || []);
  const patternedCount = combinedStyles.filter(
    (style) => typeof style === "string" && style.toLowerCase() === "patterned"
  ).length;

  return patternedCount <= 1;
}

function passesColorCheck(items) {
  const combinedColors = [...new Set(items.flatMap((item) => item.colors || []))];

  return colorPalettes.some((palette) =>
    combinedColors.every((color) => palette.includes(color))
  );
}

module.exports = { passesPatternCheck, passesColorCheck };
