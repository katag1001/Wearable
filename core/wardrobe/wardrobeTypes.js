// core/wardrobe/wardrobeTypes.js
//
// The type buttons along the top of the wardrobe. Footwear shows the
// separate footwear collection; every other button (and none) shows clothes.

export const FOOTWEAR = "footwear";

export const WARDROBE_TYPES = ["top", "outer", "bottom", "onepiece", FOOTWEAR];

export const WARDROBE_TYPE_TITLES = {
  top: "Top Half",
  outer: "Outerwear",
  bottom: "Bottom Half",
  onepiece: "One-Pieces",
  [FOOTWEAR]: "Footwear",
};
