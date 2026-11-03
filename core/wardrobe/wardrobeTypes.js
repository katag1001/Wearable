// core/wardrobe/wardrobeTypes.js
//
// The type buttons along the top of the wardrobe. Footwear shows the
// separate footwear collection; every other button (and none) shows clothes.

export const FOOTWEAR = "footwear";

export const WARDROBE_TYPES = ["top", "bottom", "outer", "onepiece", FOOTWEAR];

export const WARDROBE_TYPE_TITLES = {
  top: "Tops",
  bottom: "Bottoms",
  outer: "Outerwear",
  onepiece: "One-Pieces",
  [FOOTWEAR]: "Footwear",
};
