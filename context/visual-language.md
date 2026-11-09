# Visual language - mobile app

The look for the LovedWornSeen mobile app. **The Today screen (the
homepage) is the model**: every other screen borrows its composition, type
and boxes. Background ideas come from the reference images
(`context/example-1.jpg` … `example-6.jpg`) and the portfolio
(`../../portfolio/portfolio_v2` - read-only, never edit it), with far more
subtle colour.

Status (2026-11-09): rewritten around Today.

## 0. Everything goes through the root

**Every style lives in one place, so that similar things are changed
together.** The root is `mobile/src/theme/soft.js` (with `theme/tokens.js`
built on it) for values, and the shared components for shapes.

- **Values**: colours, fonts, text styles, spacing, radii, shadows and
  motion are named roles in `soft.js` (`accent`, `loved`, `type.menuLabel`,
  `shadows.raised`, `houseBox`, `menuTints`...). Components and screens
  use the roles only. They never use a hex, an rgba, a hue name
  (`mid.lavender`), a font size, or a hand-typed line height or letter
  spacing.
- **Shapes**: anything that appears in more than one place is one shared
  component or style. Examples are the panels (`soft/Panels`), the page
  title (`soft/PageHeader`), the house box (`houseBox`, used by the note
  banner, the menu boxes and the choice cards), the menu box
  (`ui/ListRow`) and the choice card (`ui/ActionCard`). Screens arrange
  these pieces and don't restyle them.
- **Similar items share a role**, even when they're on different screens.
  For example, every box with a name over a small-caps line uses
  `type.menuLabel` and `type.menuText`. Changing that role changes all of
  them at once.
- **Something new**: if a screen needs a look that doesn't exist yet, add a
  named role to `soft.js` (or a shared component) first, then use it.
  Never write a one-off style in the screen.
- This document names the roles, so a change to the look is a change to
  `soft.js`, plus this page when the rule itself changes.

## 1. The idea

**Milk panels floating on soft colour.** A pale, grainy, iridescent
atmosphere, and on top of it a few large milk panels with deeply rounded
corners. The colour shows only in the gaps between the panels and round
their corners. Inside the panels everything is calm: light type, plain
icons and translucent white boxes.

**The clothes are the colour.** Item photos have their backgrounds removed.
The UI never tints what's right behind a garment, so outfits sit straight on
the milk panel.

## 2. The homepage, piece by piece

This is what Today does. Other screens copy it.

### Panels (Today's "tabs")

- The page is made of **two milk panels** (`surface.milk`) with the
  atmosphere between them. The gap is `space.sm`.
- **Top panel**: runs up under the status bar, square at the top,
  `radii.sheet` (36) on its bottom corners. It holds the page title and the
  page's facts (day, weather).
- **Bottom panel**: the mirror image, rounded along its top and filling the
  rest of the screen. It holds the content (the outfit).
- Panels run edge to edge with no side margin. Their content keeps the
  `space.gutter` (24) side padding.
- Edge: `boxEdge`, a 1px rim of light along the top. No border, no drop
  shadow.

### Type, in pairs

Today's header is two matching columns, each a **headline over a
subline**:

- Page title: `type.pageTitle`, Inter Light 26 ("Hey Katy").
- Headline: `type.todayHeadline`, Inter Light 20 (weekday, temperature).
- Subline: `type.todaySubline`, Inter Light 12, uppercase, tracking 1.4,
  soft ink (tag, season). A tappable subline is just text, with no
  underline or button.

The pairs line up line for line: left column left-aligned, right column
right-aligned. Large type is always light, never bold.

### Boxes

The note banner (`today/NoteBanner`) is the house box:

- `surface.veil` (translucent white), `radii.tile` (20), `shadows.raised`
  (a soft shadow plus the light top rim), no border.
- Each line opens with a **small dot** (7px) in the hue for its job and
  holds one line of text (`type.note`). A small muted icon (an X, an arrow)
  can close it.
- Boxes sit inside a panel, never straight on the atmosphere.

### Buttons and icons

- **Icon buttons in a header are plain icons**: Feather 24, `ink.soft`, no
  circle. They dim to 0.5 opacity when pressed (the profile person on
  Today).
- **Action buttons** (heart, broken heart, shoe): plain translucent white
  circles (`surface.veil` + `shadows.soft`), soft-ink icon, no rim. Active =
  blush wash. They float over the content.
- Press: scale 0.97 over 200ms (`PressableScale`), except plain header icons
  (opacity).
- Main text buttons: lavender (`colors.selected`) pill with an ink
  uppercase tracked label. **No dark-filled buttons.**

## 3. Colour

### Ink and neutrals - never black

| Token | Value | Use |
|---|---|---|
| `ink.main` | `#3B3545` | Titles, icons |
| `ink.soft` | `#6A6374` | Body text, sublines, header icons |
| `ink.muted` | `#A29BAA` | Hints, placeholders, small arrows and X's |
| `surface.milk` | `#FCFAFB` | Panels, page base |
| `surface.pearl` | `#FAF8F6` | Behind palette swatches only |
| `surface.veil` | white 62% | Boxes and round buttons |
| `surface.white` | `#FFFFFF` | Light edges, highlights |

### Hues - washes and mids

| Hue | Wash (fills) | Mid (dots, rims, small accents) | Job |
|---|---|---|---|
| Blush | `#FBEFF3` | `#E9B8CB` | **Loved** - favourite, worn, celebration |
| Lavender | `#F3EFFA` | `#C6B6E6` | **The app** (`accent`) - focus, selection |
| Sky | `#ECF1FA` | `#AFC3E6` | **Cold** - winter, tights |
| Mint | `#EEF6F3` | `#B5D6CA` | **Fresh / done** - success, spring |
| Peach | `#FBF1EB` | `#EDC6B2` | **Warm** - summer |

Deeper siblings for icon-sized accents: blush `#C27C97`, lavender
`#8E7BB8`.

The full five-hue iridescent run appears only in the selection halo, the
temperature slider (sky → mint → peach), the bubble celebration and the
rating stars.

### Semantic

- Error: rose-clay `#9A4E5C`, on the blush wash when it needs a fill.
- Success: sage `#52705F` on the mint wash.
- No borders on either.

## 4. Atmosphere and bubbles

- **Atmosphere** behind every screen: blurred patches of all five hues
  scattered over the whole screen (random per launch), plus film grain at
  ~3-4%. On Today it leans sky/lavender on cold days and peach/blush on warm
  ones.
- With panels on top, the atmosphere shows as **strips and corners**. That
  is enough colour; nothing inside a panel needs to be tinted.
- No bubbles in the background. Bubbles live in the UI: the loader
  (breathing bubble) and the celebration (rising bubbles that pop).

## 5. Surfaces, edges, depth

- **Edges are made of light, never ink.** No dark borders or hairline
  dividers anywhere. Things are separated by panels, boxes and space.
- Shadows: `soft` `0 8px 24px rgba(46,40,56,0.06)`, `lifted`
  `0 16px 40px rgba(46,40,56,0.08)`, `raised` = soft + light top rim.
- Radii: inputs 14 · boxes/tiles 20 · cards 28 · panels/sheets 36 ·
  buttons/chips pill. `borderCurve: "continuous"` on iOS.

## 6. Type roles (`type.*` in soft.js)

| Role | Font | Size / line | Use |
|---|---|---|---|
| `pageTitle` | Inter Light | 26/32 | Top line of a page ("Hey Katy", "Wardrobe") |
| `screenTitle` | Inter Light | 30/36 | Stacked screen titles, quiz questions |
| `sheetTitle` | Inter Light | 24/30 | Sheets, full-page choosers |
| `cardTitle` | Inter Light | 22/28 | Big choice cards, empty states |
| `todayHeadline` | Inter Light | 20/26 | Headline in a headline/subline pair |
| `todaySubline` | Inter Light | 12/18, caps, 1.4 | Subline in a pair |
| `menuTitle` | Inter Light | 20/26 | Profile title (smaller than a tab page) |
| `menuLabel` | Inter Light | 16/22 | Menu box names |
| `menuText` | Inter Light | 11/16, caps, 1.2 | Menu box lines, Log out / Delete account |
| `chipLabel` | Inter Light | 11/16, caps | Chips |
| `note` | Inter Regular | 13/17 | Lines in a box |
| `body` | Inter Regular | 15/22, `ink.soft` | Paragraphs |
| `label` | Inter SemiBold | 13, caps, 1.6 | Button labels |
| `eyebrow` | Inter Light | 11, caps, 2.4 | Field labels, step counts |

Left-aligned and editorial, with generous space above titles. No emoji;
icons are Feather. (Fira Code is not loaded. Instrument Serif Italic is
loaded but not used.)

## 7. Screen notes

- **Today** (the model): top panel has "Hey <first name>" ("Hello" with no
  name) with the person icon to Profile on the right, then the two columns
  (weekday over tag, weather icon + temperature over season). The bottom
  panel holds any notices, then the outfit straight on the milk, running to
  the bottom. The note banner (tights = sky dot, trends = lavender dot) runs
  along the top of the outfit and slides with it. Broken heart and heart
  are stacked bottom left, the shoe bottom right. Wearing changes only the
  buttons, and bubbles rise over the page. No "Marked as worn" alert.
- **Profile**: built like Today. The top panel has a plain back arrow and
  "Profile" (`menuTitle`, 20 - smaller than a tab page). The bottom panel
  holds the menu, in smaller type than Today: one house box
  per item, each with a hue dot, a name (`menuLabel`, 16) over a
  one-line description (`menuText`, 11 caps) and a muted arrow. Weekly
  preferences = sky, Style preferences = blush, Settings = lavender. Log
  out and Delete account sit at the foot of the bottom panel as two `menuText`
  sublines in a pair: Log out left, Delete account right in rose-clay.
  Both confirm first. No email shown.
- **Add (the + tab)**: built like Profile. The top panel has "Add"
  (`menuTitle`), and the bottom panel has two choice cards: Add item ("From
  a photo", lavender) and Build outfit ("From your wardrobe", blush).
- **Wardrobe / Outfits**: Wardrobe is a two-up grid of item photos, no
  names. Outfits is two Pinterest-style columns, tops over bottoms, in soft
  white boxes (`colors.fieldBackground`). Filters are in the frosted sheet.
  Select mode shows iridescent halos and a floating selection bar.
- **Item add / edit / AI review**: photo large, fields below as soft
  pills.
- **Style quiz / palettes**: swatches on pure pearl, no tint. Progress is
  a row of small bubbles filling with lavender.
- **Auth**: the most atmospheric screen, with fields as floating white
  pills.

## 8. Components (`mobile/src/components/ui`, `soft`)

| Component | Looks like |
|---|---|
| `SoftScreen` / `Screen` | Atmosphere behind, milk base, gutter 24 |
| `PageHeader` | `pageTitle` + optional plain icon on the right |
| `NoteBanner` | The house box (`houseBox`): veil, radius 20, raised, dots |
| `ActionButton` | Plain veil circle, soft shadow; active = blush wash |
| `ActionCard` | Choice card: the house box with a tinted icon circle (40), `menuLabel` over `menuText`, muted arrow |
| `ListRow` | Menu box: the house box with a hue dot, `menuLabel` over `menuText`, muted arrow |
| `Panels` | `TopPanel` / `BottomPanel` / `panelPage`: the homepage composition |
| `Button` | Lavender pill (main), translucent white pill (secondary), text + `→` |
| `Chip` | White pill; selected = solid lilac, label to ink |
| `TextField` | White ~70%, no border, lavender focus glow |
| `SegmentedControl` | Lavender-wash track, white thumb |
| `Sheet` | Milk, radius 36, grab handle, plum backdrop |
| Tab bar | Milk, no border, faint shadow above; active tab on a lavender pill |
| `ImageTile` | Selected = iridescent halo + tick in a pearl bubble |
| `RangeSlider` | Sky → mint → peach track, pearl thumb |
| `Loading` / `BubbleLoader` | One breathing bubble |
| `SoftNote` / `Message` | Soft tinted note, no border |

## 9. Motion

- Gentle ease-out everywhere (`Easing.out(Easing.cubic)`): 200ms press ·
  320ms panels, sheets and boxes fading in · 450ms screens.
- No springs or overshoot, except the bubble pop. At most one ambient
  motion per screen. Respect Reduce Motion.

## 10. Not AI-looking - checklist

**Don't:** dark-filled buttons · gradient buttons or text · glass on every
surface · neon glows · emoji · centred hero + three cards · hairline
dividers · pure black or flat grey · colour inside the panels for its own
sake.

**Do:** film grain · milk panels with colour in the gaps · light, large
type · headline/subline pairs · small hue dots that mean something ·
plain icons · squircle corners · iridescence only for moments that matter.

## Built so far

- `mobile/src/theme/soft.js` holds every colour, type role, space, radius,
  shadow, motion and `atmosphereMood(weather)`. `theme/tokens.js` maps the
  everyday names (`colors`, `spacing`, `radius`...) onto it.
- `components/soft/`: `Atmosphere`, `Bubble`, `SoftScreen`, `PageHeader`,
  `BubbleLoader`, `SoftNote`, `BubbleCelebration`, `WeatherIcon`,
  `PressableScale`, `IridescentStars`, `SelectionHalo`, `TabIcon`,
  `PullUpPanel`, `softHeader` (transparent stack header; pages start below
  it via `useHeaderSpace`).
- `components/today/`: `OutfitPicker`, `ActionButton`, `NoteBanner`,
  `SwipeDeck`, `ShoeChooser`, `OutfitFeedback`, `TagPicker`.
- `components/ui/`: the kit most screens build from (see section 8).
- Fonts: `@expo-google-fonts/inter` and `instrument-serif`, loaded in
  `mobile/src/app/_layout.jsx`. Grain tile in `mobile/assets/textures/`.
- Every signed-in page lives inside the tabs, one stack per tab. The +
  tab offers Add item and Build outfit as two `ActionCard`s.
- Splash and Android icon background: milk `#FCFAFB`.
