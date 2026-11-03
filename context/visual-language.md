# Visual language - mobile app

The look for the LovedWornSeen mobile app. Based on the reference images
(`context/example-1.jpg` … `example-6.jpg`) and the portfolio
(`../../portfolio/portfolio_v2` - read-only, never edit it), but with far more
subtle colour.

Status (2026-11-03): agreed, trialled on Today, then **applied to the whole
mobile app** (see "Built so far"). Now being tweaked screen by screen.

## 1. The idea

**Soft light falling on soap film.** A pale, grainy atmosphere with iridescent
colour at its edges; calm editorial type on top; the clothes in a clear,
neutral middle.

**The clothes are the colour.** Item photos have their backgrounds removed
and the palettes are the colour gate, so the UI must never tint what's right
behind a garment.

- Colour lives in the **atmosphere** - page edges, bubbles, selection,
  celebration.
- Content lives on **pearl** - item photos, palette swatches and style-quiz
  images sit on a hue-free warm white.

## 2. From the portfolio - kept / changed

| Portfolio does | App keeps | App changes |
|---|---|---|
| Perimeter colour patches fading to a white centre (`.bubble_background`) | The composition | Lighter and less saturated; patches only reach the edges |
| Glass bubbles: clear body, conic iridescent rim, specular highlights | The anatomy | 2-4 per screen, placed by hand and cropped by the screen edge - no random bouncing |
| Inter + Fira Code, tracked uppercase labels (`0.22em`) | Both, and the label style | Large type goes light (300-400) |
| `[01] PORTFOLIO` mono eyebrow | Numbered eyebrows per tab | - |
| `→` links that slide on hover | Arrow links that slide on press | No gradient text (reads as AI, needs MaskedView) |
| Iridescent fill on hover | On press of secondary actions, and selection | Never a resting button fill |
| Spacing 4/8/12/18/28/48/72 | Same scale | - |
| 1px hairline dividers | - | Gone - separation by tone, light and space |
| Dark theme | Later ("Dusk") | Light-only first (`app.json` is `light`) |

## 3. Colour

### Ink and neutrals - never black

| Token | Value | Use |
|---|---|---|
| `ink` | `#3B3545` | Titles, primary button fill, icons |
| `inkSoft` | `#6A6374` | Body text |
| `inkMuted` | `#A29BAA` | Hints, placeholders, inactive |
| `milk` | `#FCFAFB` | Page base |
| `pearl` | `#FAF8F6` | **Behind clothes and swatches only** - no hue bias |
| `white` | `#FFFFFF` | Light edges, highlights, text on ink |

### Atmosphere tints (chroma ≤ ~4%)

| Hue | Wash | Mid (rims, small accents only) |
|---|---|---|
| Blush | `#FBEFF3` | `#E9B8CB` |
| Lavender | `#F3EFFA` | `#C6B6E6` |
| Sky | `#ECF1FA` | `#AFC3E6` |
| Mint | `#EEF6F3` | `#B5D6CA` |
| Peach | `#FBF1EB` | `#EDC6B2` |

Deeper siblings for icon-sized accents that need contrast on the pale page
(filled stars, the wear heart): blush `#C27C97`, lavender `#8E7BB8`.

### Every hue has a job

- **Blush = Loved** - favourite heart, worn today, celebration
- **Lavender = the app** - focus, selection, default atmosphere
- **Sky = cold** - winter, cool temperature bands
- **Mint = fresh / done** - success, spring
- **Peach = warm** - summer, warm temperature bands

The full five-hue iridescent gradient appears in only a few places: the
**selection halo**, the **temperature slider** (sky → mint → peach), the
**bubble celebration** and the **filled rating stars** (each star runs from
its hue to the next, so the row reads as one sweep).

### Semantic

- Error: rose-clay `#9A4E5C` on blush wash
- Success: sage `#52705F` on mint wash
- No borders on either

## 4. Surfaces, edges, depth

**Edges are made of light, never of ink.**

- No dark borders anywhere.
- Separation comes from:
  1. tonal fill (translucent white over the atmosphere);
  2. very diffuse plum-tinted shadows (`boxShadow`, RN 0.76+);
  3. where an edge is needed, a 1px **white** top highlight at ~70%.
- Shadows:
  - `soft` - `0 8px 24px rgba(46,40,56,0.06)`
  - `lifted` - `0 16px 40px rgba(46,40,56,0.08)`
  - `glow` - `0 10px 30px rgba(233,184,203,0.28)`
- Real blur only on the tab bar and sheets (`expo-blur`). Glass on every
  card is the biggest AI-template tell, and slow on Android.
- Radii: inputs 14 · tiles 20 · cards 28 · sheets 36 · buttons/chips pill.
  `borderCurve: "continuous"` on iOS (squircle corners).

## 5. Atmosphere and bubbles

- **Atmosphere** behind every screen: perimeter colour patches, white centre,
  plus **film grain at ~3-4%** (as in example 1). Grain is the strongest
  "made by a person" signal.
- **No bubbles in the background** (tried on Today, taken out 2026-11-03).
  The edge colour blends gradually into a wide white middle - no shapes,
  no visible edges.
- **Bubbles** live in the UI instead: clear body, soft iridescent rim
  (several light strokes in a pink → lavender → blue → mint → peach
  gradient), one or two highlights - the action buttons, the loader and the
  celebration.
- **No boxes around content**: the outfit sits straight on the white
  middle, with no card or tile behind the (background-removed) photos.
- **Weather-tinted Today**: patches lean sky/lavender on cold days and
  peach/blush on warm ones - felt more than noticed.

## 6. Typography

| Role | Font | Size / line | Notes |
|---|---|---|---|
| Display | Inter Light 300 | 40/44, tracking −0.5 | Screen titles |
| Title | Inter Regular 400 | 26/32 | Sheet and section heads |
| Eyebrow | Fira Code 500 | 11, tracking 2.4, UPPERCASE | `01 — TODAY`, counters `02 / 07`, metadata |
| Body | Inter Regular 400 | 15/22, `inkSoft` | |
| UI label | Inter SemiBold 600 | 13, tracking 1.6, UPPERCASE | Buttons, arrow links |
| Small | Inter Medium 500 | 12/16 | Chips, tab labels |
| Accent | Instrument Serif Italic | display size | Tried for the weekday on Today and dropped (2026-11-03) - too big, off-theme. Not in use. |

Left-aligned, editorial, generous space above titles, numbers in mono.
Fonts come from `@expo-google-fonts/*`, loaded in `mobile/src/app/_layout.jsx`.

## 7. Components - from / to

| Component | Was | Becomes |
|---|---|---|
| Screen | White, plain title | Atmosphere behind, mono eyebrow, light display title |
| Button primary | Black fill | **No big dark buttons** (2026-11-03). The main action is the default `soft` variant: a pill in the selected lavender (`colors.selected`) with an ink uppercase tracked label, `soft` shadow and light top edge. The old plum-ink `primary` has been removed. |
| Button secondary | Hairline outline | Pearl pill: translucent white, white top edge, no border. Press blooms a faint iridescent wash. |
| Button text | Grey text | Uppercase tracked label + `→` that slides 4px on press |
| Pressed state | Opacity 0.5-0.7 | Scale 0.97, 200ms ease-out |
| Card | Hairline border | White ~65%, radius 28, `soft` shadow, light top edge |
| ImageTile | Black 2px border + black tick when selected | Pearl. Selected: **iridescent halo** (2px gradient ring, 3px gap), tick in a small pearl bubble |
| Chip | Bordered, black when selected | Pearl; selected = lavender wash + ink semibold + lavender dot. Seasons use their hue. Swatches get a white ring. |
| SegmentedControl | Black thumb | Lavender-wash track, white pill thumb with `soft` shadow, slides |
| TextField | Hairline border | White ~70% fill, no border, mono eyebrow label; focus = soft lavender glow |
| Sheet | Black 42% backdrop | Plum 18% backdrop + light blur; frosted milk panel radius 36; grab handle |
| Tab bar | Grey top border | **Built:** milk bar, no border, faint shadow above; soft-ink icons (muted when inactive), Inter Medium 11 labels; active tab on a lavender-wash pill with a light top edge, fading in. (Blur still to try, needs `expo-blur`.) |
| ActionButton (heart, bin, shoe) | Grey disc / black active | **Plain circle**: translucent white fill + faint `soft` shadow, soft-ink icon - no rim or highlight (the full bubble version was too much, 2026-11-03). Active = blush wash. |
| Stepper | Bordered circles | Small pearl bubble arrows, mono `02 / 07` |
| Confetti | Six hard colours incl. `#111` | **Rising soap bubbles** that drift, wobble and pop |
| Loading | ActivityIndicator | A single **breathing bubble** (0.96 ↔ 1.04 over 2.4s) |
| EmptyState / Message | Plain / bordered | Faint bubble + serif-italic line; soft tinted notes, no border |
| RangeSlider (temperature) | Neutral | Track sky → mint → peach, pearl bubble thumb |
| Heart / stars | Black | Stars: iridescent fill when on, `inkMuted` outline when off. Action icons (heart, broken heart, shoe) all the same soft ink, same icon set |

Icons: Feather (thin, even stroke), sizes 20/24, colour `ink`. No emoji in
the UI - weather uses Feather icons.

## 8. Screen notes

- **Auth** - the most atmospheric screen: hero bubbles, light display
  wordmark, fields as floating white pills.
- **Today** - "Hey <first name>" ("Hello" with no name; Inter Light 26) with the person button to Profile on the right, then two matching header columns: weekday (Inter Light 20) over
  the tag on the left; weather icon + temperature (Inter Light 20) over the
  season on the right. Tag and season: Inter Light 12, uppercase, tracking
  1.4, soft ink. The outfit photos run to the bottom of the page; the buttons float over them - broken heart and heart stacked in the bottom left corner, the shoe in the bottom right. No rating stars on Today (rated from the outfit screen; `soft/IridescentStars` kept for later). "Wear with tights" sits above the outfit. No
  "Marked as worn" alert - the bubble celebration says it (the web keeps
  its popup; the notice carries `kind: "worn"`). Outfit straight on the white middle (no card), bubble action
  row, bubble celebration on wear.
- **Wardrobe / Outfits** - Wardrobe: a two-up grid of item photos with room around each, no names. Outfits (2026-11-03): two Pinterest-style columns that stack independently; each outfit sits tops-over-bottoms (as on Today) in a soft white box (the search box fill, `colors.fieldBackground`, no border), items small and centred. Each card goes into the shorter column, in score order, its height worked out before it draws (`outfits/outfitColumns.js`, `outfitCardHeight`).
  Filters in the frosted sheet; select mode shows halos and a floating pearl
  selection bar.
- **Item add / edit / AI review** - photo large on pearl, fields below as
  soft pills; pearl shimmer while analysing.
- **Style quiz / palettes** - swatches and images on **pure pearl, no
  tint**. Step progress is a row of small bubbles filling with lavender.
- **Profile / account** - editorial rows, no dividers: mono index (`01`),
  label, `→`. Pressed row nudges right 6px.
- **Splash / icon** - milk with a single iridescent bubble.

## 9. Motion

- Easing: gentle ease-out everywhere (`Easing.out(Easing.cubic)`).
- Durations: 200ms press · 320ms sheets/thumbs · 450ms screen fades.
- No hard springs or overshoot, except the bubble pop.
- At most one ambient motion per screen (the atmosphere drift).
  Respect Reduce Motion.

## 10. Not AI-looking - checklist

**Don't:** big dark (ink-filled) buttons · purple-to-blue gradient buttons · gradient text · glass on every
surface · neon glows · emoji in the UI · centred hero + three cards · one
radius everywhere · random particle fields · pure black or flat grey.

**Do:** film grain · hand-placed, edge-cropped bubbles · mono numerals and
tracked eyebrows · light, large type with deliberate asymmetry · hues with
meaning · squircle corners · restraint, iridescence kept for moments that
matter.

## 11. Build order

1. **Foundations** - tokens (colour / type / space / radius / shadow /
   motion), fonts, `Atmosphere` with grain and bubbles. New deps:
   `react-native-svg`, `@expo-google-fonts/*` (later `expo-blur`).
2. **Primitives** - everything in `mobile/src/components/ui/`; most screens
   restyle through these.
3. **Signature moments** - Today, selection halo, bubble celebration,
   temperature slider, breathing loader.
4. **Sweep** - remaining `borderWidth` uses, weather emoji, splash and icon.
5. **Later** - "Dusk" dark theme from the portfolio's dark tokens, muted the
   same way.

## Built so far

Theme (mobile only):

- `mobile/src/theme/soft.js` - the tokens above (colours, fonts, type,
  spacing, radii, shadows, motion) and `atmosphereMood(weather)`.
- `mobile/src/theme/tokens.js` - the app's everyday names (`colors`,
  `fontSizes`, `fontWeights`, `spacing`, `radius`, `shadows`) mapped onto
  soft.js. Replaces `core/theme/tokens.js` (removed; the web never used
  it). `fontWeights` are Inter family names, used as `fontFamily`
  (custom fonts ignore `fontWeight` on Android); every text style sets one.
- `mobile/src/components/soft/` - `Atmosphere` (SVG edge patches + white
  middle + grain), `Bubble` (SVG), `SoftScreen`, `BubbleLoader`,
  `SoftNote`, `BubbleCelebration`, `WeatherIcon`, `PressableScale`,
  `IridescentStars`, `SelectionHalo` (iridescent ring for selected tiles),
  `TabIcon`, `softHeader` (stack header options).
- `mobile/assets/textures/grain.png` - the grain tile (256px, generated
  noise; strength set by its opacity in `Atmosphere`).
- Fonts (`@expo-google-fonts/inter`, `fira-code`, `instrument-serif`) loaded
  in `mobile/src/app/_layout.jsx`; `react-native-svg` added.

Today: `app/(tabs)/(today,wardrobe,outfits,create)/index.jsx` (two-column
header, weather icon), `components/today/OutfitPicker` (outfit straight on
the page, buttons floating over it; wearing it changes nothing but the
buttons - Change outfit replaces the hearts, swiping and arrows go - with
the bubbles over the same screen), `ActionButton` (plain white circles),
`SwipeDeck` (arrow colour). `OutfitImages` has an optional `imageStyle`.

Tab bar: `app/(tabs)/_layout.jsx` + `soft/TabIcon` - Today / Wardrobe / Outfits / + (the + page, `app/(tabs)/create.jsx`, offers Add item and Build outfit as two soft cards). Profile moved to the person button on Today.

Whole app (2026-11-03):

- **The `ui/` kit**, which most screens are built from: `Screen`
  (Atmosphere behind), `Button` (ink / white pills, uppercase labels,
  squeeze on press), `Card`, `Chip`, `ChoiceCard`, `TextField` (no border,
  lavender focus glow), `SegmentedControl` (white thumb), `Sheet` (milk,
  radius 36, grab handle, plum backdrop), `ImageTile` + `OutfitCard` +
  `PalettePicker` + item filter (iridescent halo when selected), `FieldRow`
  / `ListRow` (no dividers), `RangeSlider` (sky → mint → peach track),
  `StarRating` (iridescent everywhere), `EmptyState` (faint bubble),
  `Loading` (breathing bubble), `Message` (soft notes), `FavouriteHeart`
  (blush).
- **Screens with their own pages** get the Atmosphere: Wardrobe, Outfits,
  Build outfit, Change shoes, "Not this outfit". Wardrobe / Outfits titles
  are Inter Light; their add / filter buttons are white circles.
- **Headers**: `softHeader` - transparent, so the page background runs up
  behind the back arrow (pages start below it via `useHeaderSpace`); just
  the arrow, no back title. Set in each tab's stack
  (`app/(tabs)/(today,wardrobe,outfits,create)/_layout.jsx`).
- **Tab bar on every page** (2026-11-03): every signed-in page lives inside
  the tabs, one stack per tab.
- `today/Confetti` removed; adding an item plays `BubbleCelebration`.
- Splash and Android icon background: milk `#FCFAFB`.
- **No backgrounds behind items or outfits** (2026-11-03): `itemBackground` is transparent, so item photos and outfit cards sit straight on the page, like Today. Only palette tiles keep pearl, so their colours read true.
- Still black-and-white in places? Only where a screen hard-codes something
  the sweep missed - fix as found.
