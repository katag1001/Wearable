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

// The hearts: a favourite's filled heart (ui/FavouriteHeart), and the
// round wear button once the outfit is worn (today/ActionButton's
// `active`) - filled in the blush mid with a white heart.
export const hearts = {
  favourite: mid.blush,
  worn: mid.blush,
  wornIcon: surface.white,
};

// Every temperature slider's track (ui/PointSlider, ui/RangeSlider), cold
// to warm.
export const temperatureRun = [mid.sky, mid.mint, mid.peach];

// The other 1-5 scales' track (seasonality, trends): the app's own colour,
// flat - cold and warm mean nothing there.
export const scaleRun = [accent.mid, accent.mid, accent.mid];

// The icon circles on the big choice cards (ui/ActionCard).
export const choiceTints = {
  addItem: accent.wash,
  buildOutfit: loved.wash,
  takePhoto: accent.wash,
  choosePhoto: wash.sky,
  // A planned day's two ways in (the Plan tab's day screen).
  recommendOutfits: accent.wash,
  buildOwnOutfit: loved.wash,
};

// The Plan tab's month grid (components/plan/MonthCalendar): today's fill,
// the dot under a planned day, and the day cells.
export const calendarTints = {
  today: accent.wash,
  plannedDot: accent.deep,
  day: surface.white,
};

// The dots on the app's notes (soft/NoteRow): Today's tights note is for
// the cold (sky), trends and plain news are the app's own (accent),
// success is fresh (mint) and errors are rose-clay.
export const noteTints = {
  tights: mid.sky,
  trend: accent.mid,
  info: accent.mid,
  success: mid.mint,
  error: "#9A4E5C",
};

// The dots on Profile's menu boxes (ui/ListRow).
export const menuTints = {
  weekly: mid.sky,
  style: loved.mid,
  settings: accent.mid,
  tour: mid.mint,
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

// The Atmosphere's colours: the bubble colours as they are.
export const atmosphereColours = mid;

// The Atmosphere's mix: how many of its 12 patches each hue gets, and how
// strongly they show. Mostly sky and lavender, so the page reads soft
// purply-blue, with some mint through it; one faint patch each of blush
// and peach keeps a hint of the rainbow without turning it red.
export const atmosphereMix = {
  sky: { patches: 4, strength: 1.1 },
  lavender: { patches: 3, strength: 0.9 },
  mint: { patches: 3, strength: 0.8 },
  blush: { patches: 1, strength: 0.45 },
  peach: { patches: 1, strength: 0.35 },
};

export const semantic = {
  error: noteTints.error,
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
};

// Light spaced capitals: Today's tag and season line, text actions and
// chip labels.
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
  // The "(24)" after a page title - much smaller than the title itself.
  pageCount: {
    fontFamily: fonts.light,
    fontSize: textSizes.sm,
    letterSpacing: 0,
    color: ink.muted,
  },
  // Small spaced capitals: field labels, step counts, loading text.
  eyebrow: {
    fontFamily: fonts.light,
    fontSize: textSizes.xxs,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: ink.muted,
  },
  // Paragraphs and single lines of explanation.
  body: {
    fontFamily: fonts.regular,
    fontSize: textSizes.base,
    lineHeight: 22,
    color: ink.soft,
  },
  // A bold part inside body text (spread over it).
  emphasis: {
    fontFamily: fonts.semibold,
    color: ink.main,
  },
  // Small print: slider values, scale ends, group names in tag lists,
  // placeholders and a section's line of description.
  caption: {
    fontFamily: fonts.regular,
    fontSize: textSizes.sm,
    lineHeight: 19,
    color: ink.soft,
  },
  // A day's number in the Plan tab's month (plan/MonthCalendar).
  calendarDay: {
    fontFamily: fonts.regular,
    fontSize: textSizes.xl,
    lineHeight: 22,
    color: ink.soft,
  },
  // What's typed into a text field.
  input: {
    fontFamily: fonts.regular,
    fontSize: textSizes.base,
    color: ink.main,
  },
  // Pill button labels (ui/Button).
  label: {
    fontFamily: fonts.semibold,
    fontSize: textSizes.sm,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: ink.main,
  },
  // A small secondary action drawn as plain text, like Today's tappable
  // tag line: Skip, Change, Show all, Cancel, Back, Log out (ui/TextAction).
  textAction: SMALL_CAPS,
  // The title of a stacked screen (ui/Screen) and a style quiz question:
  // the same size as Today's "Hey Katy" (pageTitle).
  screenTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h2,
    lineHeight: 32,
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
  // Empty states.
  cardTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h4,
    lineHeight: 28,
    color: ink.main,
  },
  // The title of a page opened from another (Profile, Settings, Add
  // item...) - in its top panel or the stack header - smaller than a tab
  // page's. Then each box's name and the small-caps line under it.
  menuTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h5,
    lineHeight: 26,
    color: ink.main,
  },
  menuLabel: {
    fontFamily: fonts.light,
    fontSize: textSizes.lg,
    lineHeight: 22,
    color: ink.main,
  },
  menuText: {
    ...SMALL_CAPS,
    fontSize: textSizes.xxs,
    lineHeight: 16,
    letterSpacing: 1.2,
  },
  // A heading over prose (ui/SectionTitle - Settings' sections). Light,
  // like every large line.
  sectionTitle: {
    fontFamily: fonts.light,
    fontSize: textSizes.h5,
    lineHeight: 26,
    color: ink.main,
  },
  // Today: the weekday and temperature, and the tag and season under them.
  todayHeadline: {
    fontFamily: fonts.light,
    fontSize: textSizes.h5,
    lineHeight: 26,
    color: ink.main,
  },
  todaySubline: SMALL_CAPS,
  // Chip and segment labels: Today's season line, a size smaller.
  chipLabel: {
    ...SMALL_CAPS,
    fontSize: textSizes.xxs,
    lineHeight: 16,
  },
  // A line in a note (soft/NoteRow). Regular rather than light, so it
  // reads clearly on the translucent white.
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

// The app's one spacing scale, plus the page's side margin.
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 48,
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

// Plain icons (soft/IconButton): headers, close crosses and the icons in a
// photo's corner are regular; arrows in boxes, a note's cross and the
// hearts on a card are small; a tick's check and a chip's icon are tiny.
// Large stands in for a photo (the tour's sample outfit).
export const iconSizes = {
  large: 72,
  // A quiet picture on an empty spot (Build outfit's hanger).
  medium: 44,
  regular: 24,
  small: 18,
  tiny: 14,
};

// The breathing bubble (soft/BubbleLoader) when it isn't filling a page:
// inside a button or on a photo still loading (small), or in a list's
// footer, a row or a sheet (medium).
export const loaderSizes = {
  small: 28,
  medium: 40,
};

// Squircle corners on iOS (ignored on Android).
export const continuous = { borderCurve: "continuous" };

const SOFT = "0px 8px 24px rgba(46, 40, 56, 0.06)";
const LIFTED = "0px 16px 40px rgba(46, 40, 56, 0.08)";
const TAB_ICON = `0px 4px 14px ${fade(accent.mid, 0.35)}`;

// Nothing is outlined - no borders, rims or inset lines anywhere, so every
// fill reaches its edge. Things stand out by their drop shadow alone.
export const shadows = {
  soft: SOFT,
  // Cast upwards, by the tab bar.
  tabBar: "0px -6px 24px rgba(46, 40, 56, 0.04)",
  // The accent glow under the active tab icon.
  tabIcon: TAB_ICON,
  // Raised: buttons and every box (house boxes, outfit and item cards,
  // tiles).
  raised: SOFT,
  // A text field while typing in it: a soft accent glow, no ring.
  focus: `0px 8px 22px ${fade(accent.mid, 0.45)}`,
  // A slider's thumb: lifted.
  thumb: LIFTED,
  // The active tab's bubble: the accent glow.
  tabBubble: TAB_ICON,
  // The round select tick on an outfit card.
  tick: SOFT,
};

// The edge of the panels (Today's tabs, pull-up panels, sheets, dialogs)
// and text fields: the soft shadow, no border. Spread it into a style;
// change it here to change them all.
export const boxEdge = {
  boxShadow: SOFT,
};

// The house box (context/visual-language.md): every note, Profile's menu
// boxes, the choice cards, the weekly day boxes and the selection bar. Translucent white,
// rounded, the soft shadow, no border. Spread it
// into a style; change it here to change them all.
export const houseBox = {
  borderRadius: radii.tile,
  ...continuous,
  backgroundColor: surface.veil,
  boxShadow: shadows.raised,
};

// The app tour's speech bubble (src/tour/TourOverlay): nothing dims behind
// it, so a deeper shadow than the boxes' - a close one to define its edge
// and a wide soft one to lift it.
const BUBBLE_EDGE = "0px 1px 4px rgba(46, 40, 56, 0.12)";

export const tourBubble = {
  fill: surface.milk,
  // The arrow is solid white, with the same close shadow round its edge.
  arrow: surface.white,
  arrowShadow: BUBBLE_EDGE,
  shadow: `${BUBBLE_EDGE}, 0px 12px 32px rgba(255, 255, 255, 0.12)`,
};

export const motion = {
  press: 200,
  panel: 320,
  screen: 450,
  easing: Easing.out(Easing.cubic),
  pressedScale: 0.97,
};

// How the weather leans the atmosphere patches (on top of atmosphereMix):
// cold days lean sky, warm days a touch warmer (blush and peach), never
// red. Mild (or no weather yet) sits in between.
const MOODS = {
  cold: { blush: 0.8, lavender: 1, sky: 1.15, mint: 0.9, peach: 0.7 },
  mild: { blush: 1, lavender: 1, sky: 1, mint: 1, peach: 1 },
  warm: { blush: 1.15, lavender: 1, sky: 0.85, mint: 0.9, peach: 1.15 },
};

export const atmosphereMood = (weather) => {
  if (!weather || typeof weather.max !== "number") return MOODS.mild;

  const average = (weather.min + weather.max) / 2;

  if (average < 10) return MOODS.cold;
  if (average > 18) return MOODS.warm;
  return MOODS.mild;
};
