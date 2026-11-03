// The box shared by the wardrobe's item cards and the outfit cards: the
// search box's soft white fill and light top edge, no border, with room
// around the photos so they sit smaller in the middle. The top padding
// leaves space for the favourite heart in the corner.

import { colors, radius, spacing } from "../../theme/tokens";

// Between the two columns, and between cards in a column.
export const CARD_GAP = spacing.md;

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
  borderRadius: radius.lg,
  borderCurve: "continuous",
  backgroundColor: colors.fieldBackground,
  boxShadow: `inset 0px 1px 0px ${colors.lightEdge}`,
};

// The favourite heart's place and size on a card.
export const CARD_HEART_SIZE = 20;

export const cardHeart = {
  position: "absolute",
  top: spacing.sm,
  right: spacing.sm,
};
