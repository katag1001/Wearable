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

// A hex colour at `alpha` (0-1) as rgba, so faded versions of a colour
// still come from the one place it's defined.
export const fade = (hex, alpha) => {
  const [r, g, b] = [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16)
  );

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// A hex colour at `alpha` as it looks laid over white, as a solid colour -
// for fills that must read flat whatever is behind them.
export const onWhite = (hex, alpha) =>
  `#${[1, 3, 5]
    .map((start) => {
      const channel = parseInt(hex.slice(start, start + 2), 16);

      return Math.round(channel * alpha + 255 * (1 - alpha))
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;

// Colours by job. Components use these (or ./tokens.js, built on them)
// rather than naming a hue, so recolouring a job happens here only.

// The app's own colour (lavender): what's selected or focused, the main
// button, the active tab, switch tracks, slider thumbs, quiet placeholder
// fills and faint lines.
export const accent = {
  wash: wash.lavender,
  mid: mid.lavender,
  deep: deep.lavender,
};

// Loved / worn (blush): the wear heart, and Today's round buttons when
// they light up.
export const loved = {
  wash: wash.blush,
  mid: mid.blush,
  deep: deep.blush,
};

// The temperature sliders' track, cold to warm.
export const temperatureRun = [mid.sky, mid.mint, mid.peach];

// The icon circles on the big choice cards (ui/ActionCard).
export const choiceTints = {
  addItem: accent.wash,
  buildOutfit: loved.wash,
  takePhoto: accent.wash,
  choosePhoto: wash.sky,
};

// The full iridescent run - selection halo, temperature track, bubbles.
export const iridescent = [mid.blush, mid.lavender, mid.sky, mid.mint, mid.peach];

// The rating stars' colours: each star runs from one to the next, with
// mint between the others so every star carries some green.
export const ratingRun = [
  mid.blush,
  mid.mint,
  mid.lavender,
  mid.mint,
  mid.sky,
  mid.mint,
];

// The Atmosphere's colours: the bubble colours a touch clearer - a cooler
// pink than mid.blush so it reads pink rather than peachy where it blends,
// and a brighter blue and green.
export const atmosphereColours = {
  ...mid,
  blush: "#EFA6C6",
  sky: "#9CBEF2",
  mint: "#A3DAC6",
};

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

// Light spaced capitals: Today's tag and season line, and chip labels.
const SMALL_CAPS = {
  fontFamily: fonts.light,
  fontSize: textSizes.xs,
  lineHeight: 18,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: ink.soft,
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
  // The title of a stacked screen (ui/Screen) and a style quiz question.
  screenTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h1,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: ink.main,
  },
  // Sheets and Today's full-page choosers (shoes, feedback).
  sheetTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h3,
    lineHeight: 30,
    color: ink.main,
  },
  // The big choice cards and empty states.
  cardTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h4,
    lineHeight: 28,
    color: ink.main,
  },
  cardText: {
    fontFamily: fonts.regular,
    fontSize: textSizes.md,
    lineHeight: 20,
    color: ink.soft,
  },
  // ui/SectionTitle and the line under it.
  sectionTitle: {
    fontFamily: fonts.regular,
    fontSize: textSizes.h5,
    lineHeight: 26,
    color: ink.main,
  },
  sectionText: {
    fontFamily: fonts.regular,
    fontSize: textSizes.sm,
    lineHeight: 19,
    color: ink.soft,
  },
  // Today: the weekday and temperature, and the tag and season under them.
  todayHeadline: {
    fontFamily: fonts.light,
    fontSize: textSizes.h5,
    lineHeight: 26,
    color: ink.main,
  },
  todaySubline: SMALL_CAPS,
  // Chip labels (quick filters, choices): Today's season line, a size
  // smaller.
  chipLabel: {
    ...SMALL_CAPS,
    fontSize: textSizes.xxs,
    lineHeight: 16,
  },
  // Today's round note bubble. Regular rather than light, so it reads
  // darker over the photos.
  note: {
    fontFamily: fonts.regular,
    fontSize: textSizes.sm,
    lineHeight: 17,
    color: ink.main,
  },
  // The tab bar's labels (their colour comes from the tab bar's tint).
  // Inter sits taller than the system font the bar is sized for; a fixed
  // line lifts it clear.
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: textSizes.xxs,
    letterSpacing: 0.3,
    lineHeight: 14,
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

const SOFT = "0px 8px 24px rgba(46, 40, 56, 0.06)";
const LIFTED = "0px 16px 40px rgba(46, 40, 56, 0.08)";
// The 1px rim of light along the top of a raised surface.
const LIGHT_RIM = `inset 0px 1px 0px ${surface.lightEdge}`;
const TAB_ICON = `0px 4px 14px ${fade(accent.mid, 0.35)}`;

export const shadows = {
  soft: SOFT,
  lifted: LIFTED,
  glow: `0px 10px 30px ${fade(loved.mid, 0.38)}`,
  // Cast upwards, by the tab bar and pull-up panels.
  tabBar: "0px -6px 24px rgba(46, 40, 56, 0.04)",
  panel: "0px -10px 30px rgba(46, 40, 56, 0.07)",
  // The accent glow under the active tab icon.
  tabIcon: TAB_ICON,
  // Raised and lit along the top: buttons, cards, choice cards.
  raised: `${SOFT}, ${LIGHT_RIM}`,
  // A chosen choice card: an accent glow under the light rim.
  chosen: `0px 10px 28px ${accent.mid}66, ${LIGHT_RIM}`,
  // A text field while typing in it.
  focus: `0px 0px 0px 3px ${accent.mid}66, 0px 8px 22px ${accent.mid}40`,
  // A slider's thumb: lifted, with an accent line along its bottom.
  thumb: `${LIFTED}, inset 0px -1px 0px ${accent.mid}55`,
  // The active tab's bubble: the glow, the light rim and a sky line along
  // its bottom.
  tabBubble: `${TAB_ICON}, ${LIGHT_RIM}, inset 0px -1px 0px ${mid.sky}55`,
  // The round select tick on an outfit card: soft, with a faint accent ring.
  tick: `${SOFT}, inset 0px 0px 0px 1.5px ${fade(accent.deep, 0.28)}`,
};

// The edge of the app's boxes - the Today tabs, the item and outfit cards,
// the search boxes, filter buttons, the Add item /
// Build outfit cards, field rows and week tags: a 1px rim of light along
// the top, no drop shadow. Spread it into a style; change it here to
// change them all.
export const boxEdge = {
  boxShadow: LIGHT_RIM,
};

export const motion = {
  press: 200,
  panel: 320,
  screen: 450,
  easing: Easing.out(Easing.cubic),
  pressedScale: 0.97,
};

// How strongly each atmosphere patch shows. All five bubble colours count
// the same; cold days lean sky, warm days a touch warmer (blush and peach),
// never red. Mild (or no weather yet) sits in between.
const MOODS = {
  cold: { blush: 0.7, lavender: 1, sky: 1.25, mint: 0.9, peach: 0.6 },
  mild: { blush: 1, lavender: 1, sky: 1, mint: 1, peach: 1 },
  warm: { blush: 1.2, lavender: 1, sky: 0.7, mint: 0.8, peach: 1.3 },
};

export const atmosphereMood = (weather) => {
  if (!weather || typeof weather.max !== "number") return MOODS.mild;

  const average = (weather.min + weather.max) / 2;

  if (average < 10) return MOODS.cold;
  if (average > 18) return MOODS.warm;
  return MOODS.mild;
};
