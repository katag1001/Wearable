// The app's everyday token names (colors, fontSizes, spacing, radius...),
// all on the soft palette in ./soft.js (context/visual-language.md).
// Screens use these; ./soft.js has the fuller set (washes, mids, type
// styles, shadows, motion) for the parts that need it.

import { fonts, ink, mid, radii, semantic, shadows, surface, textSizes, wash } from "./soft";

export { fonts, shadows, textSizes };

export const colors = {
  main: ink.main,
  secondary: ink.soft,
  tag: ink.main,
  muted: ink.muted,
  inverse: surface.white,

  // Screens sit on the Atmosphere; this is its base, for anything drawn
  // without it (sheets, splash).
  pageBackground: surface.milk,
  // Raised surfaces: translucent white over the atmosphere, no border.
  cardBackground: "rgba(255, 255, 255, 0.7)",
  // Text fields, the filter buttons beside them and the outfit cards.
  fieldBackground: "rgba(255, 255, 255, 0.78)",
  // Edges are made of light, never ink: a faint lavender-grey line where
  // one is truly needed, and a light rim for raised things.
  border: "rgba(142, 123, 184, 0.14)",
  hoverBorder: "rgba(142, 123, 184, 0.28)",
  lightEdge: surface.lightEdge,
  // Something chosen: selected chips, choices and days - and a favourite
  // heart.
  selected: `${mid.lavender}80`,
  // Quiet fills: segmented tracks, placeholders, inactive controls.
  imageBackground: wash.lavender,
  // Behind item photos: nothing - their backgrounds are removed, so the
  // clothes sit straight on the page.
  itemBackground: "transparent",

  errorBackground: semantic.errorWash,
  errorBorder: "transparent",
  error: semantic.error,

  successBackground: semantic.successWash,
  successBorder: "transparent",
  success: semantic.success,

  // Plum-tinted, light.
  overlayBackdrop: "rgba(46, 40, 56, 0.2)",
};

export const fontSizes = {
  title: textSizes.h1,
  sectionTitle: textSizes.h5,
  body: textSizes.base,
  small: textSizes.sm,
  tag: textSizes.xs,
};

// Inter weights by name, used as fontFamily (a custom font ignores
// fontWeight on Android).
export const fontWeights = {
  light: fonts.light,
  regular: fonts.regular,
  medium: fonts.medium,
  semibold: fonts.semibold,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: radii.input,
  md: radii.input,
  lg: radii.tile,
  xl: radii.card,
  pill: radii.pill,
};

export const letterSpacing = {
  tight: 0.4,
  normal: 0.6,
  wide: 1.4,
};
