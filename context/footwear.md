# Footwear

Footwear lives in its own `Footwear` collection, separate from `Clothes`.
It is **never matched into outfits**: adding, editing or deleting footwear
doesn't create, re-check or remove any matches. Instead, the Today page
suggests shoes for the outfit worn today - see "Shoes on the Today page"
below.

## Where it shows

My Wardrobe (`/clothes`, `src/pages/Clothes.jsx`) has a 5th type button,
**Footwear**. Selecting it swaps the page to the footwear list (its own
search, filter panel and subtype row). With no button selected, or any
other button, the page shows clothes as before.

Each list has its own session cache (`clothes` / `footwear` in
`src/context/PagedCacheProvider.jsx`); only the one on show fetches.

## Adding and editing

| File | Role |
|---|---|
| `src/components/clothes/addWardrobeItem.jsx` | Add Item: choose Clothing or Footwear, then opens that form. Editing skips the choice. |
| `src/components/footwear/addUpdateFootwear.jsx` | The two-page footwear modal, validation and saving |
| `src/components/footwear/footwearModalOne.jsx` | Page one: name, image, type (all types shown - no category step) |
| `src/constants/footwearOptions.jsx` | Types per gender, their default seasons/tags, and name synonyms |

Page two is clothing's `ModalTwo`, and the form state and auto-fill reuse
`useClothingForm` and `useClothingDetection`, so footwear is pre-filled
from its name and type exactly like clothing (Part 1 of
`clothing-and-matching-flow.md`). Style is `Patterned` when there's more
than one colour, otherwise `Plain`, and isn't shown.

Unisex footwear is every type from the woman and man lists (as with
clothing).

## Server

| File | Role |
|---|---|
| `server/models/AllModels.js` | `footwearSchema` - like clothes but no `type` (role). Has the worn fields ready for later. |
| `server/controllers/footwearControllers.js` | CRUD for `/footwear`, plus cleanup on account deletion |
| `server/services/footwearQueryService.js` | Search / filters / paging for `GET /footwear/?page=` |

`GET /footwear/options` returns `{ colors, styles, tags, subtypes }`.

Image clean-up works the same as clothing (`server/services/imageService.js`):
replacing a footwear image on update deletes the old one on the server,
deleting footwear deletes its image, and a save that fails after uploading
removes the new image via `POST /cloudinary/delete`.

## Shoes on the Today page

Once an outfit is marked worn today, a **Shoes** box sits beside it (under
it on narrow screens). It shows **all** the user's footwear, one at a time,
best first. Nothing is stored on matches - the box pairs shoes with the
outfit's clothes, which `GET /today/get` populates with their `subtype`.

| File | Role |
|---|---|
| `src/components/today/footwear/todayFootwearBox.jsx` | The box: loading, order, arrows, Wear these, undo |
| `src/components/today/footwear/footwearRanking.js` | Pure ranking rules |
| `src/components/today/footwear/footwearApi.js` | Requests |
| `src/components/today/footwear/footwearCache.js` | Today's order + worn shoe (localStorage, one day) |
| `src/constants/footwearWeather.js` | Weather points |
| `src/constants/footwearColour.js` | Colour and pattern points |
| `shared/colorPalettes.json` | Outfit palettes + colour caps per level (shared with matching) |
| `shared/footwearMatrices.json` | Baseline pairing scores per gender (hand-edit) |
| `shared/footwearByGender.json` | Footwear types per gender (the matrix columns) |
| `shared/footwearScoring.json` | Neutral scores |
| `server/constants/footwearScoreBaseline.js` | Checks the matrices on server start; baseline lookup |
| `server/services/footwearScoreService.js` | Learning rules + storage (`FootwearScore`) |

### Order

The shoe is paired with the outfit's **bottom**, or its **one-piece** if it
has no bottom (an outfit with both uses the bottom).

1. **Weather first:** every shoe today's weather doesn't penalise comes
   before every shoe it does, so nothing else can lift an unsuitable shoe
   above a suitable one.
2. **Then groups**, like Today's outfits: in today's season and has today's
   tag, then season only, then tag only, then neither.
3. **Score** within a group: matrix baseline (0-90) + the user's learned
   adjustment, kept within 0-100, + weather points + colour points +
   pattern points. Freshness plays no part - people rewear the same shoes.

### Colour and pattern

`src/constants/footwearColour.js`, using the user's colour level and the
same palettes and caps as outfits (`shared/colorPalettes.json`, which
`server/utils/colorPalettes.js` also reads). Every colour on the shoe
counts. The outfit's colours are the match's combined `colors`.

The outfit's colour count before the shoes picks the mode:

| Level | Add a colour | Match the outfit's colours |
|---|---|---|
| min | 1-3 | 4+ |
| mid | 1-3 | 4+ |
| max | 1-4 | 5+ |

"Fits" means outfit + shoe colours fit one of the level's palettes and stay
within its cap (min 4, mid 6, max none). An outfit that itself fits no
palette (e.g. user-made) is judged on the cap only.

| Mode | Shoe | Points |
|---|---|---|
| Add | Adds a colour and fits | +15 |
| Add | Only the outfit's colours | +5 |
| Add | Doesn't fit | −10 |
| Match | Only the outfit's colours | +15 |
| Match | Adds a colour and fits | 0 |
| Match | Doesn't fit | −10 |

If **no** shoe fits, colour points are replaced by Black +15, White +10,
Brown +5 (a shoe takes its best colour), anything else 0.

Pattern (a shoe is patterned with more than one colour): plain outfit +10;
patterned outfit min −20, mid −5, max 0.

Neutral baselines: **50** for every shoe when the outfit has no bottom or
one-piece (so the other factors decide), **45** for a pairing missing from
the user's matrix (e.g. a shoe added under another gender preference).

"All boots" includes Walking boots. Weather points (several can apply at once):

| Weather | Points |
|---|---|
| Snow | Snow boots +20, other boots +10; Sandals, Heeled sandals, Flipflops, Ballerinas, Heels −20 |
| Rain (incl. drizzle, showers, storms) | All boots +10, Smart and Casual trainers +5; Sandals, Heeled sandals, Flipflops, Ballerinas −15 |
| Hot (max ≥ 22°) | Sandals, Heeled sandals, Flipflops +10; Snow boots, Knee-high boots −15 |
| Cold (max ≤ 10°) | All boots +10; Sandals, Heeled sandals, Flipflops −15, Ballerinas −5 |

The order is worked out once per outfit and kept for the day, so scrolling
and wearing don't reshuffle it.

### Learning

Stored per user per bottom + shoe-type pairing in `FootwearScore`
(`FOOTWEAR_LEARNING_DELTAS` in `server/constants/scoring.js`):

- **Scrolling right past a shoe:** −0.1, at most once per pairing per
  day. Never for the shoe worn today.
- **Wear these:** +3, marks the shoe worn (`lastWornDate`, `timesWorn`,
  `timesWornThisYear`, `wornYear`) and takes back a rejection of that
  pairing from the same day.
- **Wearing a different shoe, or a different outfit, the same day:** the
  previous shoe's worn values are restored exactly and its +3 taken back.

Nothing is learned for an outfit with no bottom or one-piece. Footwear
scores are wiped when the user changes gender (like outfit scores) and when
the account is deleted.

### Endpoints

| Route | |
|---|---|
| `GET /footwear/today` | `{ items, pairings, gender, colourLevel }` in one request |
| `PUT /footwear/pairings/reject` | `{ bottomSubtype, footwearSubtype, todayStart }` |
| `PUT /footwear/:id/wear` | `{ bottomSubtype, wornDate, todayStart }` → `{ item, pairing }` |
| `PUT /footwear/:id/unwear` | `{ bottomSubtype, snapshot }` → `{ item, pairing }` |

### Changing the footwear types

Add, rename or remove a type in `shared/footwearByGender.json` (unisex must
be every woman and man type), then give it an entry in `FOOTWEAR_DEFAULTS`
(`src/constants/footwearOptions.jsx`), a column in every row of
`shared/footwearMatrices.json`, and any weather points
(`src/constants/footwearWeather.js`). The server refuses to start if the
matrices and lists disagree. Saved footwear and `FootwearScore` pairings
store the type name, so a rename or removal needs a one-off script in
`server/scripts/` (delete it once run): update `Footwear.subtype`, and
move each `FootwearScore.footwearSubtype` to the new name - dropping the
old document instead if the user already has a pairing under the new name,
since pairings are unique per user + bottom + footwear type.

When "Trainers" was split into "Smart trainers" and "Casual trainers",
anything still saved as "Trainers" was meant to move to "Casual trainers".
Until it does, it scores the neutral 45 for being missing from the matrix.
