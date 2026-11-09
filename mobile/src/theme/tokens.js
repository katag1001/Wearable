// The app's colours by everyday job name, all on the soft palette in
// ./soft.js (context/visual-language.md). Spacing, radii, type, shadows
// and icon sizes come from ./soft.js only - it has the one scale of each.

import { accent, ink, onWhite, surface } from "./soft";

export const colors = {
  main: ink.main,
  secondary: ink.soft,
  muted: ink.muted,
  inverse: surface.white,

  // Screens sit on the Atmosphere; this is its base, for anything drawn
  // without it (sheets, splash).
  pageBackground: surface.milk,
  // Something chosen - chips, choice cards, segments - and the main
  // button: the lilac as a solid colour (as it looks on white), so one
  // flat fill whatever is behind it.
  selected: onWhite(accent.mid, 128 / 255),
  // Quiet fills: grab handles, slider rails, placeholders.
  imageBackground: accent.wash,
  // Behind item photos: nothing - their backgrounds are removed, so the
  // clothes sit straight on the page.
  itemBackground: "transparent",

  // Plum-tinted, light.
  overlayBackdrop: "rgba(46, 40, 56, 0.2)",
};
