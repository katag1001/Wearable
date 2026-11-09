# Visual language - mobile app

The look for the LovedWornSeen mobile app. **The Today screen (the
homepage) is the model**: every other screen borrows its composition, type
and boxes. Background ideas come from the reference images
(`context/example-1.jpg` … `example-6.jpg`) and the portfolio
(`../../portfolio/portfolio_v2` - read-only, never edit it), with far more
subtle colour.

Status (2026-11-09): rewritten around Today, then brought in line with the
app after a full style audit (one spacing scale, shared pieces for every
repeated shape, app-styled dialogs).

## 0. Everything goes through the root

**Every style lives in one place, so that similar things are changed
together.** The root is `mobile/src/theme/soft.js` for values, and the
shared components for shapes. `theme/tokens.js` only maps everyday colour
job names (`colors.main`, `colors.selected`...) onto `soft.js`.

- **Values**: colours, fonts, text styles, spacing, radii, shadows, icon
  and loader sizes, and motion are named roles in `soft.js` (`accent`,
  `loved`, `hearts`, `type.menuLabel`, `shadows.raised`, `houseBox`,
  `menuTints`, `iconSizes`...). Components and screens use the roles only.
  They never use a hex, an rgba, a hue name (`mid.lavender`), a font size,
  or a hand-typed line height or letter spacing. Text always takes a
  `type.*` role, never a font family plus a size.
- **One spacing scale**: `space` - `xxs 4 · xs 8 · sm 12 · md 18 · lg 24 ·
  xl 32 · xxl 48`, plus `gutter` (24) and `pageTop` (18). There is no
  second scale.
- **Shapes**: anything that appears in more than one place is one shared
  component or style. Screens arrange these pieces and don't restyle them
  (section 8 lists them).
- **Similar items share a role**, even when they're on different screens.
  For example, every box with a name over a small-caps line uses
  `type.menuLabel` and `type.menuText`, every small text action uses
  `type.textAction`, every field label uses `type.eyebrow`. Changing that
  role changes all of them at once.
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
  shadow. Pull-up panels and sheets are panels too: the same radius 36 and
  the same rim, no shadow.

### Type, in pairs

Today's header is two matching columns, each a **headline over a
subline**:

- Page title: `type.pageTitle`, Inter Light 26 ("Hey Katy").
- Headline: `type.todayHeadline`, Inter Light 20 (weekday, temperature).
- Subline: `type.todaySubline`, Inter Light 12, uppercase, tracking 1.4,
  soft ink (tag, season). A tappable subline is just text, with no
  underline or button - the same style is `type.textAction`, used for every
  small text action in the app.

The pairs line up line for line: left column left-aligned, right column
right-aligned. Large type is always light, never bold.

### Boxes

The note banner (`today/NoteBanner`) is the house box (`houseBox`):

- `surface.veil` (white 62%), `radii.tile` (20), `shadows.raised` (a soft
  shadow plus the light top rim), no border.
- Each line is a `soft/NoteRow`: a **small dot** (7px) in the hue for its
  job (`noteTints`), one line of text (`type.note`) and optionally a small
  muted X to close it.
- Every note in the app is this box (`soft/SoftNote` holds one line):
  errors have a rose-clay dot and line, success a mint dot, news ("Updating
  your outfits…", the weather notice) the lavender `info` dot.
- Boxes sit inside a panel, never straight on the atmosphere.

### Buttons and icons

- **Plain icons** (`soft/IconButton`): no circle or box, Feather where it
  has the icon. Header icons are `iconSizes.regular` (24) in `ink.soft`;
  close crosses, arrows and the icons in a photo's corner are `ink.muted`.
  Arrows inside boxes, a note's cross and a card's hearts are
  `iconSizes.small` (18). They dim to 0.5 opacity when pressed.
- **Back** is always the plain arrow (`soft/BackButton`) - in a top panel
  or the stack header. Stepping back *inside* a page (the quiz, the
  mismatch picker) is the text action "Back".
- **Action buttons** (heart, broken heart, shoe): plain translucent white
  circles (`surface.veil` + `shadows.soft`), soft-ink icon, no rim. Active
  (worn) = filled blush with a white heart (`hearts.worn` /
  `hearts.wornIcon`). They float over the content. The outfit screen's
  "Wear today" uses the same button, small.
- Press: scale 0.97 over 200ms (`PressableScale`) for everything tappable
  - buttons, boxes, chips, segments, tiles, cards, text actions - except
  plain icons (opacity).
- Main text buttons: lavender (`colors.selected`) pill with an ink
  uppercase tracked label. **No dark-filled buttons.**

## 3. Colour

### Ink and neutrals - never black

| Token | Value | Use |
|---|---|---|
| `ink.main` | `#3B3545` | Titles, names, selected labels |
| `ink.soft` | `#6A6374` | Body text, sublines, text actions, header icons |
| `ink.muted` | `#A29BAA` | Hints, placeholders, field labels, small arrows and X's |
| `surface.milk` | `#FCFAFB` | Panels, sheets, dialogs, page base |
| `surface.pearl` | `#FAF8F6` | Behind colour-family tiles only |
| `surface.veil` | white 62% | **The one translucent white**: boxes, cards, text fields, secondary pills, round buttons |
| `surface.white` | `#FFFFFF` | Chips, segmented tracks, tick bubbles, light edges |

### Hues - washes and mids

| Hue | Wash (fills) | Mid (dots, rims, small accents) | Job |
|---|---|---|---|
| Blush | `#FBEFF3` | `#E9B8CB` | **Loved** - favourite, worn, celebration |
| Lavender | `#F3EFFA` | `#C6B6E6` | **The app** (`accent`) - focus, selection |
| Sky | `#ECF1FA` | `#AFC3E6` | **Cold** - winter, tights |
| Mint | `#EEF6F3` | `#B5D6CA` | **Fresh / done** - success, spring |
| Peach | `#FBF1EB` | `#EDC6B2` | **Warm** - summer |

Deeper siblings for icon-sized accents: blush `#C27C97`, lavender
`#8E7BB8` (pull-to-refresh's spinner).

- **Selected** is one flat lilac everywhere (`colors.selected`, the
  lavender mid at half strength as it looks on white): chips, choice cards,
  segments and the main button. No glow, and labels never change weight.
- **Hearts** (`hearts`): a favourite's filled heart and the worn button are
  the blush mid.
- **Sliders**: every temperature slider (the quiz scale, an outfit's range,
  the filter) has the sky → mint → peach track (`temperatureRun`). The
  other 1-5 scales (seasonality, trends) are flat lavender (`scaleRun`).
- The full five-hue iridescent run appears only in the selection halo, the
  bubble celebration, the bubbles and the rating stars.

### Semantic

- Error: rose-clay `#9A4E5C` (a note's dot and line, Delete account).
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
- Shadows: `soft` `0 8px 24px rgba(46,40,56,0.06)`, `raised` = soft + light
  top rim. **Every box is raised** (house boxes, outfit and item cards,
  tiles); panels and text fields have only the rim (`boxEdge`).
- Radii: inputs 14 · boxes/tiles 20 · cards 28 (outfit and item cards,
  dialogs) · panels/sheets 36 · buttons/chips pill.
  `borderCurve: "continuous"` on iOS.

## 6. Type roles (`type.*` in soft.js)

| Role | Font | Size / line | Use |
|---|---|---|---|
| `pageTitle` | Inter Light | 26/32 | Top line of a tab page ("Hey Katy", "Wardrobe", "Add") |
| `screenTitle` | Inter Light | 26/32 | Stacked screen titles, quiz questions, log in |
| `sheetTitle` | Inter Light | 24/30 | Sheets, full-page choosers |
| `cardTitle` | Inter Light | 22/28 | Empty states |
| `todayHeadline` | Inter Light | 20/26 | Headline in a headline/subline pair |
| `menuTitle` | Inter Light | 20/26 | A page opened from another (Profile, Settings, Add item...), the stack header, dialog titles |
| `sectionTitle` | Inter Light | 20/26 | A heading over prose (Settings) |
| `todaySubline` | Inter Light | 12/18, caps, 1.4 | Subline in a pair |
| `textAction` | Inter Light | 12/18, caps, 1.4 | Skip, Change, Show all, Cancel, Back, Log out, Wear today |
| `menuLabel` | Inter Light | 16/22 | Box names, choice cards, field values, weekly days |
| `menuText` | Inter Light | 11/16, caps, 1.2 | Menu box lines |
| `chipLabel` | Inter Light | 11/16, caps | Chips and segments |
| `eyebrow` | Inter Light | 11, caps, 2.4, muted | Every field label (forms, outfit details, filters), loading text |
| `body` | Inter Regular | 15/22, `ink.soft` | Paragraphs and lines of explanation |
| `emphasis` | Inter SemiBold | - | A bold part inside body text |
| `caption` | Inter Regular | 13/19, `ink.soft` | Slider values, scale ends, tag group names, placeholders |
| `input` | Inter Regular | 15 | Text typed into a field |
| `note` | Inter Regular | 13/17 | Lines in a note |
| `label` | Inter SemiBold | 13, caps, 1.6 | Pill button labels |
| `tabLabel` | Inter Medium | 11/14 | Tab bar labels |

Left-aligned and editorial, with generous space above titles. No emoji;
icons are Feather, with MaterialCommunityIcons only for what Feather
hasn't got (hearts, the broken heart, the shoe, the clothing tabs). Fira
Code is not loaded. Instrument Serif Italic is loaded but not used.

## 7. Screen notes

- **Today** (the model): top panel has "Hey <first name>" ("Hello" with no
  name) with the person icon to Profile on the right, then the two columns
  (weekday over tag, weather icon + temperature over season). The bottom
  panel holds any notes, then the outfit straight on the milk, running to
  the bottom. The note banner (tights = sky dot, trends = lavender dot) runs
  along the top of the outfit and slides with it. Broken heart and heart
  are stacked bottom left, the shoe bottom right. Wearing changes only the
  buttons, and bubbles rise over the page. No "Marked as worn" alert.
- **Pages opened from another** (Profile, Weekly preferences, Style
  preferences, Settings, Add item, a new item, Mismatch) are built like
  Today: the top panel has the back arrow and the title (`menuTitle`), the
  bottom panel the content (`ui/Screen` with `pageTitle`). They have no
  stack header.
- **Profile**: the bottom panel holds the menu: one house box per item,
  each with a hue dot, a name (`menuLabel`) over a one-line description
  (`menuText`) and a muted arrow. Weekly preferences = sky, Style
  preferences = blush, Settings = lavender. Log out and Delete account sit
  at the foot as two text actions in a pair: Log out left, Delete account
  right in rose-clay. Both confirm first. No email shown.
- **Add (the + tab)**: built like Profile with a tab page's full-size
  title; two choice cards: Add item ("From a photo", lavender) and Build
  outfit ("From your wardrobe", blush).
- **Full-screen pages** (an outfit, an existing item, Build outfit) keep a
  transparent stack header: the plain back arrow and a `menuTitle` title,
  with the photos over the atmosphere and the details on a pull-up panel.
  Plain icons in the header (Build outfit's + to save).
- **Wardrobe / Outfits**: the title, chips and search row (`ui/SearchRow`:
  the field with a plain filter icon beside it) above the list. Wardrobe is
  a two-up grid of item photos in cards, no names. Outfits is two
  Pinterest-style columns, tops over bottoms, in the same cards
  (`ui/cardBox`: veil, radius 28, raised). Filters are in the sheet. Select
  mode shows iridescent halos, the selected tick and a floating selection
  bar (a house box) over the bottom of the list.
- **Item add / edit / AI review**: photo large, fields below, each labelled
  with `eyebrow`; Change / Done are text actions.
- **Style quiz / colour families**: colour-family tiles on pure pearl, no
  tint. There is no progress indicator. Back is a text action beside the
  Next pill.
- **Auth**: the most atmospheric screen, with fields as floating white
  fields (radius 14) straight on the atmosphere.
- **Dialogs**: every question and notice is the app's own dialog
  (`soft/Dialog`), never the system alert: a milk card (radius 28, light
  rim) over the plum backdrop, `menuTitle` over `body`, the first choice as
  the lavender pill (Leave and Delete included), any others as white pills,
  Cancel as the text action. Only the phone's permission prompts look like
  the system.

## 8. Components (`mobile/src/components/ui`, `soft`)

| Component | Looks like |
|---|---|
| `SoftScreen` / `Screen` | Atmosphere behind, milk base, gutter 24; `Screen` with `pageTitle` draws the two panels |
| `TopPanel` / `BottomPanel` / `panelPage` | The homepage composition |
| `PageHeader` | `pageTitle` (or `menuTitle` with `small`), optional back arrow and plain icon; a count in muted light type |
| `IconButton` / `BackButton` | A plain icon; the back arrow |
| `NoteRow` / `NoteBanner` / `SoftNote` / `Message` | A dot + line; the house box holding them |
| `SheetHeader` | A sheet's or chooser's title with its close cross |
| `Dialog` (`showDialog`, `DialogHost`) | The app's pop-ups (section 7) |
| `ActionButton` | Plain veil circle, soft shadow; active = blush with a white icon |
| `ActionCard` | Choice card: the house box with a tinted icon circle (40), `menuLabel` over `menuText`, muted arrow |
| `ListRow` | Menu box: the house box with a hue dot, `menuLabel` over `menuText`, muted arrow |
| `ChoiceCard` | An answer: the house box, `menuLabel` on the left; selected = lilac fill |
| `Button` | Lavender pill (main), veil pill (secondary), text action (text); optional Feather icon |
| `TextAction` | Plain `textAction` words; `tone="error"` in rose-clay |
| `Chip` | White pill; selected = solid lilac, label to ink; optional small icon |
| `SegmentedControl` | White pill track, selected segment lilac, chip labels |
| `TextField` | Veil, radius 14, rim only, lavender focus glow; label in `eyebrow` |
| `SearchRow` | A text field with the plain filter icon |
| `FieldRow` | `eyebrow` label over a `menuLabel` value, Change as a text action |
| `SectionTitle` | `sectionTitle` over prose; with `field`, an `eyebrow` field label |
| `Sheet` | Milk panel, radius 36, rim, grab handle, plum backdrop; eases in over 320ms |
| `ImageTile` | Selected = iridescent halo + `SelectedTick` |
| `SelectedTick` | A 24 white bubble with a check, top left |
| `cardBox` / `OutfitCard` / `ItemTile` / `OutfitHearts` | The card; favourite + broken heart in its corner |
| `FavouriteHeart` | Plain heart; favourited = filled `hearts.favourite` |
| `PointSlider` / `RangeSlider` / `SliderRail` | The graded rail (`temperatureRun` or `scaleRun`), white thumbs |
| `PullUpPanel` | Milk panel, radius 36, rim, grab handle |
| `Loading` / `BubbleLoader` | One breathing bubble - the only loader, `loaderSizes` when small |
| `EmptyState` | Bubble, `cardTitle`, `body`; `compact` = one body line |
| `SoftRefreshControl` | Pull to refresh in deep lavender on milk |
| Tab bar | Milk, no border, faint shadow above; active tab on a lavender pill |

## 9. Motion

- Gentle ease-out everywhere (`Easing.out(Easing.cubic)`): 200ms press and
  dialogs · 320ms panels, sheets, boxes fading in and cards sliding in ·
  450ms screens.
- No springs or overshoot, except the bubble pop. At most one ambient
  motion per screen. Respect Reduce Motion.

## 10. Not AI-looking - checklist

**Don't:** dark-filled buttons · gradient buttons or text · glass on every
surface · neon glows · emoji · centred hero + three cards · hairline
dividers · pure black or flat grey · colour inside the panels for its own
sake · system alerts.

**Do:** film grain · milk panels with colour in the gaps · light, large
type · headline/subline pairs · small hue dots that mean something ·
plain icons · squircle corners · iridescence only for moments that matter.

## Built so far

- `mobile/src/theme/soft.js` holds every colour, type role, space, radius,
  shadow, icon size, loader size, motion and `atmosphereMood(weather)`.
  `theme/tokens.js` holds only `colors` (job names on the soft palette).
- `components/soft/`: `Atmosphere`, `BackButton`, `Bubble`,
  `BubbleCelebration`, `BubbleLoader`, `Dialog`, `IconButton`,
  `IridescentStars`, `LoopingRow`, `NoteRow`, `PageHeader`, `Panels`,
  `PressableScale`, `PullUpPanel`, `PullUpScrollView`, `SelectionHalo`,
  `SheetHeader`, `SoftNote`, `SoftRefreshControl`, `SoftScreen`,
  `TabButton`, `TabIcon`, `WeatherIcon`, `softHeader` (transparent stack
  header; pages start below it via `useHeaderSpace`).
- `components/today/`: `OutfitPicker`, `ActionButton`, `NoteBanner`,
  `SwipeDeck`, `ShoeChooser`, `OutfitFeedback`, `TagPicker`.
- `components/ui/`: the kit most screens build from (see section 8).
- Fonts: `@expo-google-fonts/inter` and `instrument-serif`, loaded in
  `mobile/src/app/_layout.jsx` (which also mounts `DialogHost`). Grain tile
  in `mobile/assets/textures/`.
- Every signed-in page lives inside the tabs, one stack per tab. The +
  tab offers Add item and Build outfit as two `ActionCard`s.
- Splash and Android icon background: milk `#FCFAFB`.
