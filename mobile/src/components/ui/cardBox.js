// The box shared by the wardrobe's item cards and the outfit cards: a
// card (radii.card) in the house white, raised like every box, no border,
// with room around the photos so they sit smaller in the middle. The top
// padding leaves space for the hearts in the corner.

import { radii, shadows, space, surface } from "../../theme/soft";

// Between the two columns, and between cards in a column.
export const CARD_GAP = space.sm;

export const CARD_PADDING = {
  sides: 18,
  top: 38,
  bottom: 20,
};

// The width the photos get inside a card `width` wide.
export const cardContentWidth = (width) => width - CARD_PADDING.sides * 2;

// Each of two columns' width, with the page gutter either side.
export const twoColumnWidth = (screenWidth, gutter) =>
  Math.floor((screenWidth - gutter * 2 - CARD_GAP) / 2);

export const cardBox = {
  paddingTop: CARD_PADDING.top,
  paddingHorizontal: CARD_PADDING.sides,
  paddingBottom: CARD_PADDING.bottom,
  borderRadius: radii.card,
  borderCurve: "continuous",
  backgroundColor: surface.veil,
  boxShadow: shadows.raised,
};

// The hearts' place on a card (small icons: outfits/OutfitHearts).
export const cardHeart = {
  position: "absolute",
  top: space.xs,
  right: space.xs,
};
