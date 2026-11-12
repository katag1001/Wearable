# How temperature ranges work

**Only matches (outfits) have a temperature range.** Clothing items don't:
there's no temperature on the add/edit form, in the `Clothes` schema or on
the Clothes page. A match's `min_temp` and `max_temp` (°C, daytime outdoor)
are worked out on the server from the **subtypes and fabrics** in the
outfit, using preset numbers. The client never supplies them.

In short:

1. Every top and bottom subtype has a **warmth level from 1 to 5**. The
   **warmest top + warmest bottom** pick a **base range**; every other top
   takes off a small **layer bonus**. Each onepiece has its own range.
2. **Fabrics** nudge the range (linen cooler, wool warmer), at most 3°.
3. Every outer has **warmth points** that move the range down to colder
   days.
4. **Minimums** stop an outfit going colder than makes sense without a coat,
   or with a particular coat.
5. **Maximum caps**: layered tops 28°, a level-4 bottom 25°, a level-5
   bottom 20°, any turtleneck 20°, ski/snow pants 10°.
6. The user's **temperature preference** shifts the whole range - after
   the caps, so it still moves a capped maximum.

Ski/snow pants are never matched without an outer at all (`REQUIRES_OUTER`
in `server/constants/requiresLayering.js`) - a matching rule, not a
temperature one.

Files:

| File | Role |
|---|---|
| `server/constants/temperatureGroups.js` | **Every number** - levels, base ranges, layer points, fabric limit, onepiece ranges, outer points, minimums, caps, preference shift |
| `shared/fabrics.json` | Each fabric's `warmth` (next to its `seasons`) |
| `server/services/presetTemperatureService.js` | The rules that combine them (`computePresetTemperatureRange`) |
| `server/services/outfitEvaluator.js` | `describeOutfit` calls it for every new match |
| `server/services/temperatureService.js` | Matching a saved range against today's weather |
| `server/scripts/rematchAll.js` | Rebuilds every outfit you haven't interacted with, giving them ranges from the current numbers |

---

## Part 1 - The presets

All of these live in `temperatureGroups.js` (fabric warmth in
`shared/fabrics.json`). The tables below show the values at the time of
writing; the files are the source of truth.

### 1.1 Levels

| Top level | Subtypes |
|---|---|
| **1** Summer | Vest, Croptop, Off-the-shoulder top, Halter/strappy top, Tube top, Knit vest/tank, Short t-shirt, Bodysuit, Linen shirt, Fancy top, Party top, Tunic, Waistcoat |
| **2** Light long | Long-sleeve t-shirt, 3/4 sleeve top, Buttondown shirt, Denim shirt, Oversized shirt, Fancy/Floaty/Peasant blouse, Short turtleneck |
| **3** Light knit | Fine-knit jumper, Light cardigan, Long turtleneck |
| **4** Mid | Thin turtleneck jumper, Turtleneck (man) |
| **5** Warm | Hoodie/sweatshirt, Chunky knit jumper, Thick turtleneck jumper, Warm cardigan |

| Bottom level | Subtypes |
|---|---|
| **1** Short | Mini skirt and all shorts |
| **2** Airy long | Floaty/Fitted maxi skirt, Linen pants, Floaty trousers, Cropped trousers |
| **3** Light long | Smart skirt, Midi-skirt, Winter mini skirt, Cropped jeans, Leggings |
| **4** Long | All other jeans, Tailored (wide leg) trousers, Flared trousers, Chinos, Cargo pants, Sweatpants |
| **5** Warm | Wool trousers, Leather trousers, Ski/snow pants |

### 1.2 Base ranges

`BASE_RANGES` - the warmest top's level with the warmest bottom's level,
no outer. With no top level 1 is used (`NO_TOP_LEVEL`), with no bottom
level 4 (`NO_BOTTOM_LEVEL`).

| | B1 | B2 | B3 | B4 | B5 |
|---|---|---|---|---|---|
| **T1** | 22–38 | 20–35 | 18–32 | 17–28 | 14–22 |
| **T2** | 18–26 | 17–25 | 15–23 | 13–22 | 11–19 |
| **T3** | 16–23 | 15–22 | 13–21 | 11–20 | 9–17 |
| **T4** | 14–21 | 12–20 | 10–19 | 8–18 | 6–15 |
| **T5** | 14–21 | 11–19 | 9–17 | 7–17 | 5–14 |

Level-5 jumpers are nearly always worn over something (`REQUIRES_LAYERING`),
so the T5 row assumes a thin top underneath. A hoodie isn't on that list,
so a hoodie worn alone comes out about a degree warmer than it really is.

### 1.3 Onepieces

`ONEPIECE_RANGES` gives each onepiece its own range (e.g. Summer dress
22–36, Jumpsuit 15–26, Winter dress 6–16).

### 1.4 Points

- `LAYER_BONUS` - every top other than the warmest takes this off the
  range, by its own level: 1 / 2 / 3 / 3 / 4. The warmest layer decides
  how warm the outfit is; what's with it adds a little.
- `ONEPIECE_LAYER_POINTS` - every top worn with a onepiece takes this off
  the onepiece's range, by level: 1 / 3 / 4 / 5 / 6.
- **Fabric** - each fabric's `warmth` in `shared/fabrics.json`: −2 linen,
  crochet, seersucker; −1 broderie, satin; +1 velvet, corduroy, leather,
  suede; +2 tweed, chunky knit, wool; +3 shearling/fleece, faux fur; 0 the
  rest (and no fabric). Only tops, bottoms and onepieces count - an
  outer's points already cover its fabric. The total is limited to
  `FABRIC_SHIFT_LIMIT` (3) either way. `FABRIC_NAMED_SUBTYPES` lists
  fabrics a subtype's level already assumes (Linen on a Linen shirt, Wool
  on Wool trousers...) - those don't count again.
- `OUTER_WARMTH_POINTS` - how far each outer moves the range down (e.g.
  Bolero 1, Blazer 2, Trench coat 4, Lightweight down jacket 5, Wool coat
  9, Puffer coat 11).

### 1.5 Minimums and caps

- `NO_OUTER_MIN_TEMP` (14) - with no outer, the minimum is never below
  this: colder than that needs a coat.
- `OUTER_MIN_TEMPS` - with outers, the minimum is never below the lowest
  of theirs (e.g. Denim jacket 10, Puffer coat −10) - a blazer under a
  trench coat is floored at the trench's 6.
- `SKIRT_DRESS_MIN_TEMP` (7) - an outfit with a skirt or dress
  (`SKIRT_DRESS_SUBTYPES`) is never below this, with any number of
  outers. It's the bare-legs floor, so with tights (Part 5) it goes down
  by the tights shift, to 5. With an outer, the higher floor wins.
- `OUTER_CEILING_BASE` (25) - an outfit with outers is never suitable above
  this minus the outers' total points (23° with a blazer, 14° with a puffer
  coat).
- `OUTER_MIN_SPAN` (7) - an outfit with outers always covers at least this
  many degrees: the minimum is lowered to the capped maximum minus 7 if
  needed. Stops a light outfit under a jacket being squeezed into a few
  degrees by the ceiling above.
- **Maximum caps** - the lowest one that applies wins:
  `LAYERED_MAX_TEMP` (28) with layered tops (a second top, or a top with
  a onepiece); `BOTTOM_MAX_TEMPS` by the bottom's level (4: 25, 5: 20);
  `SUBTYPE_MAX_TEMPS` for any subtype in the outfit (every turtleneck 20,
  Ski/snow pants 10). A minimum above the cap is lowered to it.
- `MIN_SPAN` (3) - every outfit covers at least this many degrees: a
  narrower range is widened **upwards** from its minimum (so a floor stays
  exact - 14–14 becomes 14–17), but never past the cap; what's left goes
  below the minimum instead (a short turtleneck + mini skirt is 17–20,
  not 18–21).
- `TEMPERATURE_LIMITS` (−20 to 50) - the same bounds as the sliders.

### 1.6 The temperature preference

The style quiz asks "Do you generally feel too cold or too hot?" on a 1-5
scale (1 "I'm always too cold", 3 "Neutral", 5 "I'm always too hot"), saved
as `preferences.temperature`. `TEMPERATURE_PREFERENCE_SHIFT` moves both ends
of the range: **1 → +1**, 2 → +0.5, 3 → 0, 4 → −0.5, **5 → −1**, so ranges
can end in .5. The saved `min_temp`/`max_temp` already include it. A
missing preference counts as 3.

---

## Part 2 - The calculation

`computePresetTemperatureRange(items, temperaturePreference)`, step by step.
It reads each item's `type` (role), `subtype` and `fabric`.

1. **Base range.** With a onepiece: its own range (a user-built outfit with
   more than one uses the coldest), minus `ONEPIECE_LAYER_POINTS` for
   every top with it. Otherwise `BASE_RANGES[warmest top][warmest bottom]`
   minus `LAYER_BONUS` for every other top.
2. **Fabric.** The fabric total (limited to ±3) moves the whole range down.
3. **Outers.** Their points are added together; the whole range moves
   down by the total, the maximum is never above `OUTER_CEILING_BASE`
   minus the total, and the minimum is lowered if needed so the range is
   at least `OUTER_MIN_SPAN` wide.
4. **Floors.** The minimum is raised to the floor (no outer 14; else the
   lowest outer's; a skirt or dress never below 7 - the higher wins). If
   that lifts it above the maximum, the maximum is raised to match.
5. **Caps**, then `MIN_SPAN` (see 1.5).
6. **Preference.** Both ends move by `TEMPERATURE_PREFERENCE_SHIFT`, kept
   within `TEMPERATURE_LIMITS`.

### Unknown subtypes

A subtype missing from the presets falls back to a middle value (level 3
for a top or bottom, a 15–25 onepiece, a 5-point outer). It's reported in
`unknownSubtypes` and caught by `server/specs/presetTemperatureService.spec.js`.

### Worked examples

Preference 3 (no shift):

| Outfit | Steps | Range |
|---|---|---|
| Thin turtleneck jumper + Straight leg jeans | T4/B4 8–18 → floor 14 | **14–18** |
| Fine-knit jumper + Straight leg jeans | T3/B4 11–20 → floor 14 | **14–20** |
| Short t-shirt + Chunky knit jumper + Straight leg jeans + Denim jacket | T5/B4 7–17 → tee −1: 6–16 → jacket −2, ceiling 23, span 7: 4–14 → floor 10 | **10–14** |
| Short t-shirt + Midi-skirt in linen | T1/B3 18–32 → linen +2 | **20–34** |
| Cocktail dress in velvet + Bolero | 18–28 → velvet −1: 17–27 → bolero −1, ceiling 24: 16–24 → floor 14 | **16–24** |
| Long-sleeve t-shirt + Hoodie + Ski/snow pants + Puffer coat | T5/B5 5–14 → tee −2: 3–12 → puffer −11, ceiling 14, span 7: −8–1 | **−8–1** |
| Long turtleneck + Buttondown shirt + Mini skirt | T3/B1 16–23 → shirt −2: 14–21 → turtleneck cap 20 | **14–20** |

---

## Part 3 - When ranges are worked out

- **Automatic matches** (`processMatches`) and **user-built matches**
  (`createMatch`) both get their range from `describeOutfit`, with the
  user's preference from `getUserMatchingPreferences`.
- **Temperature never rejects an outfit.** Every combination has a range.
- **Editing an item's fabric** recalculates the range of its outfits in
  place (`matchRefreshService.js`, `ITEM_FIELD_TO_OUTFIT_FIELDS.fabric`) -
  no rematch.
- **Editing a match by hand:** the match card
  (`src/components/matches/viewMatchesCard.jsx`) can still change a match's
  range directly. It's saved as it is and never recalculated - a hand
  edit makes the match protected, so rematching keeps it.
- **Changing the numbers or the preference later:** existing matches keep
  their ranges. Run `node server/scripts/rematchAll.js` to preview, then
  with `--confirm` to rebuild every outfit you haven't interacted with,
  which gives them ranges from the new numbers. Favourite, user-made,
  rated, worn and hand-edited outfits keep their ranges.

---

## Part 4 - Where match ranges are used

### 4.1 Today's outfits

1. The client (`core/weather/openMeteo.js`, web and mobile) gets today's
   **daytime** min/max from Open-Meteo's 15-minute temperatures, **07:30 to
   22:30** local time (`core/constants/daytimeHours.js`) - the overnight
   low is left out. It's cached for the day (fetched again if the window changes), shifted by the weather offset
   (sunny / rain), and posted to `/today/create` with the season and the
   user's weekday.
2. `createToday` (once per day) keeps matches marked for today's season
   that fit a weather tier (`todayTierOf` in
   `server/services/todaySelectionService.js`). Each outfit goes in the
   first tier it fits; a tier only joins while the ones above have fewer
   than 200, ranked below them:
   - **tier 1**: `min_temp` and `max_temp` each close to the day's min
     and max - the minimum within **2°** and the maximum within **1°**
     either way (10–20° takes minimums 8–12 and maximums 19–21) - **or** covers all of the day (`min_temp <= min`
     and `max_temp >= max`) - both ranked together;
   - **tiers 2, 3, 4**: covers at least **90%**, **80%**, **70%** of it
     (`todayCoverageFraction` in `server/services/temperatureService.js`,
     measured against the **day's** range).
3. `server/services/todayRankingService.js` orders each tier (today's
   tag, freshness, score - temperature isn't part of it) and the list is
   capped at **200**. Details: `context/clothing-and-matching-flow.md`
   7.1; numbers in `server/constants/todayOutfits.js`.

### 4.2 Filters

- **Matches page:** the temperature filter uses today's tier-1 rule - a
  match is kept when its min and max are each close to the chosen min
  and max (minimum within 2°, maximum within 1° - `CLOSE_MATCH_MIN` /
  `CLOSE_MATCH_MAX`), or its range
  **contains** the whole chosen range. A slider end left at the edge
  (-10° / 50°) means no limit on that side; with one end chosen, only that
  end is checked (close to it or beyond it). Rule in
  `server/services/matchQueryService.js` (`temperatureCondition`); edges
  dropped in `core/utils/matchQuery.js`.
- **Clothes page:** no temperature filter - items have no range
  (`showTemperature={false}` on the shared `Filter`).

---

## Part 5 - Tights

A match's `min_temp`/`max_temp` is always the range **without** tights.
Some outfits can also be worn with tights, which suits a range
`shift` (2°) colder at both ends. That range is worked out when it's
needed and never stored, so changing the shift needs no reset.

On Today, the tights range's minimum never goes below the outfit's floors
from Part 2 step 4 (14° with no outer, the outer's minimum, and for a
skirt or dress the bare-legs 7° less the shift, so 5° - `minTempFloor` in `presetTemperatureService.js`, plus the
user's preference shift, via `savedMinTempFloor` in `tightsService.js`).
So a jumper and skirt with no coat saved at 15° can only reach 14° with
tights, not 13°. The Matches filter still uses the plain shift.

**The item's answer.** The item form asks "Would you wear this with
tights?" for every skirt, dress and shorts (shorts for women and unisex
only - men are never asked). It starts on the subtype's default from
`askBySubtype` in `shared/tights.json`, and the answer is saved on the
item as `wearWithTights`. An item saved before the question existed uses
the default. Anything not on the list (trousers, playsuits, rompers,
jumpsuits, overalls) never takes tights.

| Default yes | Default no |
|---|---|
| Mini, Maxi, Smart and Midi skirts; Casual, Cocktail, Work and Winter dresses; Fancy shorts | Summer, Evening and Wedding guest dresses; Casual, Denim, Linen, Cargo and Skater shorts |

**Which outfits** (`canWearTights` in `server/services/tightsService.js`):

- a skirt, dress or shorts worn with tights (its answer, or the default);
  **and**
- a top of level `TIGHTS_MIN_TOP_LEVEL` (4) or warmer, or **any** outer.

Saved on the match as `tights: true` by `describeOutfit`, by an item edit
that changes the answer (`matchRefreshService`), and by the reset and
rescore scripts.

**Not in this outfit.** A match can also be flagged `noTights` - "not
with tights in this outfit". The outfit then takes tights only when
`tights` is true and `noTights` isn't (`takesTights`). It's set from:

- the outfit's edit page (web card editor and the app's outfit screen): a
  "Can wear with tights" switch, shown when `tights` is true;
- Today's broken heart → "Can't wear this with tights"
  (`clothing-and-matching-flow.md` 7.3), which can instead set the
  item's answer to no.

The reset and rescore scripts recalculate `tights` but leave `noTights`
alone.

**Where it's used:**

- **Today** (`todayFitOf` in `server/services/todaySelectionService.js`):
  an outfit that takes tights is checked against both ranges and goes in the
  better tier (without tights on a tie). When the tights range won, the
  Today entry has `withTights: true` and the card says "Wear with tights".
- **Matches filter** (`temperatureCondition` in
  `server/services/matchQueryService.js`): an outfit that takes tights
  also passes when its tights range does.
- **Match card:** shows only the range without tights (the "With tights"
  line was removed 2026-10-23). The app's copy of the tights rules is
  `core/matches/tights.js`.

---

## Changing the numbers

| What | Where (`server/constants/temperatureGroups.js` unless stated) |
|---|---|
| Which level a top/bottom is | `TOP_LEVELS` / `BOTTOM_LEVELS` |
| Top + bottom ranges | `BASE_RANGES` (and `NO_TOP_LEVEL` / `NO_BOTTOM_LEVEL`) |
| Onepiece ranges | `ONEPIECE_RANGES` |
| Extra top layers | `LAYER_BONUS`, `ONEPIECE_LAYER_POINTS` |
| Fabric warmth / its limit / fabrics a subtype already assumes | `warmth` in `shared/fabrics.json` / `FABRIC_SHIFT_LIMIT` / `FABRIC_NAMED_SUBTYPES` |
| Outer warmth | `OUTER_WARMTH_POINTS` |
| Minimum with no outer / with outers | `NO_OUTER_MIN_TEMP` / `OUTER_MIN_TEMPS` |
| Minimum for a skirt or dress | `SKIRT_DRESS_MIN_TEMP`, `SKIRT_DRESS_SUBTYPES` |
| Warmest day for an outfit with outers | `OUTER_CEILING_BASE` |
| Narrowest range for an outfit with outers | `OUTER_MIN_SPAN` |
| Narrowest range for any outfit | `MIN_SPAN` |
| Highest maximum: layered tops / by bottom level / by subtype | `LAYERED_MAX_TEMP` / `BOTTOM_MAX_TEMPS` / `SUBTYPE_MAX_TEMPS` |
| Preference shift | `TEMPERATURE_PREFERENCE_SHIFT` |
| Which tops let an outfit take tights | `TIGHTS_MIN_TOP_LEVEL` |
| Items that need an outer to be matched at all | `REQUIRES_OUTER` in `server/constants/requiresLayering.js` |
| Today's weather tiers and cap | `CLOSE_MATCH_MIN` / `CLOSE_MATCH_MAX` / `FULL_COVERAGE` / `PARTIAL_COVERAGE_STEPS` / `TODAY_OUTFIT_LIMIT` in `server/constants/todayOutfits.js` |
| Daytime hours for today's weather | `core/constants/daytimeHours.js` |
| Tights shift / which skirts, dresses and shorts are asked about, and their defaults | `shared/tights.json` (`askBySubtype`; then run the reset script so `tights` flags follow) |

After changing them, restart the server and run the reset script (Part 3)
so existing matches follow.

Tests: `server/specs/presetTemperatureService.spec.js` (the rules, written
against the constants so they keep passing when numbers are tuned) and
`server/specs/temperatureService.spec.js` (today matching). Run them with
`cd server && node --test specs/*.spec.js`.
