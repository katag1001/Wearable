// The soft visual language (context/visual-language.md): colours, type,
// spacing, radii, shadows and motion. ./tokens.js maps the app's everyday
// token names onto it.

import { Easing } from "react-native";

// Ink is a deep plum-grey, never black. Pearl sits behind clothes and
// swatches only: a warm white with no hue, so garments read true.
export const ink = {
  main: "#3B3545",
  soft: "#6A6374",
  muted: "#A29BAA",
};

export const surface = {
  milk: "#FCFAFB",
  pearl: "#FAF8F6",
  white: "#FFFFFF",
  // Translucent white over the atmosphere (cards, bubbles).
  veil: "rgba(255, 255, 255, 0.62)",
  // The 1px "edge made of light" on top of a raised surface.
  lightEdge: "rgba(255, 255, 255, 0.75)",
};

// Each hue has a job: blush = loved/worn, lavender = the app (focus,
// selection), sky = cold, mint = fresh/success, peach = warm.
// Washes fill large areas; mids are for small accents only.
export const wash = {
  blush: "#FBEFF3",
  lavender: "#F3EFFA",
  sky: "#ECF1FA",
  mint: "#EEF6F3",
  peach: "#FBF1EB",
};

export const mid = {
  blush: "#E9B8CB",
  lavender: "#C6B6E6",
  sky: "#AFC3E6",
  mint: "#B5D6CA",
  peach: "#EDC6B2",
};

// Deeper siblings for icon-sized accents that need contrast on the pale
// page (filled stars, the wear heart).
export const deep = {
  blush: "#C27C97",
  lavender: "#8E7BB8",
};

// The full iridescent run - selection halo, temperature track, bubbles.
export const iridescent = [mid.blush, mid.lavender, mid.sky, mid.mint, mid.peach];

export const semantic = {
  error: "#9A4E5C",
  errorWash: wash.blush,
  success: "#52705F",
  successWash: wash.mint,
};

// Family names as loaded in app/_layout.jsx.
export const fonts = {
  light: "Inter_300Light",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  mono: "FiraCode_500Medium",
  serifItalic: "InstrumentSerif_400Regular_Italic",
};

export const type = {
  display: {
    fontFamily: fonts.light,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.5,
    color: ink.main,
  },
  // One word per screen at most.
  accent: {
    fontFamily: fonts.serifItalic,
    fontSize: 44,
    lineHeight: 48,
    color: ink.main,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 26,
    lineHeight: 32,
    color: ink.main,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: ink.muted,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: ink.soft,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: ink.main,
  },
  small: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: ink.soft,
  },
};

// The portfolio's scale, plus the page's side margin.
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 18,
  lg: 28,
  xl: 48,
  xxl: 72,
  gutter: 24,
};

export const radii = {
  input: 14,
  tile: 20,
  card: 28,
  sheet: 36,
  pill: 999,
};

// Squircle corners on iOS (ignored on Android).
export const continuous = { borderCurve: "continuous" };

export const shadows = {
  soft: "0px 8px 24px rgba(46, 40, 56, 0.06)",
  lifted: "0px 16px 40px rgba(46, 40, 56, 0.08)",
  glow: "0px 10px 30px rgba(233, 184, 203, 0.38)",
};

export const motion = {
  press: 200,
  panel: 320,
  screen: 450,
  easing: Easing.out(Easing.cubic),
  pressedScale: 0.97,
};

// How strongly each atmosphere patch shows. Cold days lean sky/lavender,
// warm days peach/blush; mild (or no weather yet) sits in between.
const MOODS = {
  cold: { blush: 0.55, lavender: 1.1, sky: 1.25, mint: 0.9, peach: 0.4 },
  mild: { blush: 0.85, lavender: 1, sky: 0.85, mint: 1, peach: 0.8 },
  warm: { blush: 1.15, lavender: 0.8, sky: 0.5, mint: 0.8, peach: 1.25 },
};

export const atmosphereMood = (weather) => {
  if (!weather || typeof weather.max !== "number") return MOODS.mild;

  const average = (weather.min + weather.max) / 2;

  if (average < 10) return MOODS.cold;
  if (average > 18) return MOODS.warm;
  return MOODS.mild;
};
