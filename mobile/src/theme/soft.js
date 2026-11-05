// The soft visual language (context/visual-language.md): colours, type,
// spacing, radii, shadows and motion. This is the one place to change how
// the app looks - every colour, font and text size starts here.
// ./tokens.js maps the app's everyday token names onto it.

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
  serifItalic: "InstrumentSerif_400Regular_Italic",
};

// Every text size in the app, smallest to largest.
export const textSizes = {
  xxs: 11,
  xs: 12,
  sm: 13,
  md: 14,
  base: 15,
  lg: 16,
  xl: 17,
  h5: 20,
  h4: 22,
  h3: 24,
  h2: 26,
  h1: 30,
  display: 40,
  accent: 44,
};

export const type = {
  // The top line of every tab page (components/soft/PageHeader).
  pageTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h2,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: ink.main,
  },
  display: {
    fontFamily: fonts.light,
    fontSize: textSizes.display,
    lineHeight: 44,
    letterSpacing: -0.5,
    color: ink.main,
  },
  // One word per screen at most.
  accent: {
    fontFamily: fonts.serifItalic,
    fontSize: textSizes.accent,
    lineHeight: 48,
    color: ink.main,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: textSizes.h2,
    lineHeight: 32,
    color: ink.main,
  },
  // Small spaced capitals: field labels, step counts, loading text.
  eyebrow: {
    fontFamily: fonts.light,
    fontSize: textSizes.xxs,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: ink.muted,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: textSizes.base,
    lineHeight: 22,
    color: ink.soft,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: textSizes.sm,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: ink.main,
  },
  small: {
    fontFamily: fonts.medium,
    fontSize: textSizes.xs,
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
  // The page's side margin, and the space above its first line (under the
  // safe area).
  gutter: 24,
  pageTop: 18,
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
  // Cast upwards, by the tab bar and pull-up panels.
  tabBar: "0px -6px 24px rgba(46, 40, 56, 0.04)",
  panel: "0px -10px 30px rgba(46, 40, 56, 0.07)",
  // The lavender glow under the active tab icon.
  tabIcon: "0px 4px 14px rgba(198, 182, 230, 0.35)",
};

export const motion = {
  press: 200,
  panel: 320,
  screen: 450,
  easing: Easing.out(Easing.cubic),
  pressedScale: 0.97,
};

// How strongly each atmosphere patch shows. Lavender always leads, so the
// page stays purplish; cold days lean sky, warm days a touch warmer (blush
// and peach), never red. Mild (or no weather yet) sits in between.
const MOODS = {
  cold: { blush: 0.6, lavender: 1.1, sky: 1.25, mint: 0.9, peach: 0.5 },
  mild: { blush: 0.9, lavender: 1, sky: 1, mint: 1, peach: 0.9 },
  warm: { blush: 1.2, lavender: 1, sky: 0.7, mint: 0.8, peach: 1.3 },
};

export const atmosphereMood = (weather) => {
  if (!weather || typeof weather.max !== "number") return MOODS.mild;

  const average = (weather.min + weather.max) / 2;

  if (average < 10) return MOODS.cold;
  if (average > 18) return MOODS.warm;
  return MOODS.mild;
};
