# How temperature ranges work

**Only matches (outfits) have a temperature range.** Clothing items don't:
there's no temperature on the add/edit form, in the `Clothes` schema or on
the Clothes page. A match's `min_temp` and `max_temp` (°C, daytime outdoor)
are worked out on the server from the **subtypes** in the outfit, using
preset numbers. The client never supplies them.

In short:

1. Every top and bottom subtype belongs to a **group**. Each top group +
   bottom group pair has a **base range**. Each onepiece has its own range.
2. The **innermost top** sets the base. Every top worn over it moves the
   range down by its **layer points**.
3. Every outer has **warmth points** that move the range down to colder
   days.
4. **Minimums** stop an outfit going colder than makes sense without a coat,
   or with a particular coat.
5. **Maximum caps**: an outfit with **layered tops** is capped by its
   warmest layer (warm jumper/cardigan 18°, light jumper/cardigan 24°,
   anything else 28°), and one with a **long bottom** at 25°.
6. The user's **temperature preference** shifts the whole range - after
   the caps, so it still moves a capped maximum.

Files:

| File | Role |
|---|---|
| `server/constants/temperatureGroups.js` | **Every number** - groups, base ranges, onepiece ranges, points, minimums, caps, preference shift |
| `server/services/presetTemperatureService.js` | The rules that combine them (`computePresetTemperatureRange`) |
| `server/services/outfitEvaluator.js` | `describeOutfit` calls it for every new match |
| `server/services/temperatureService.js` | Matching a saved range against today's weather |
| `server/scripts/resetMatchTemperatures.js` | Recalculates every existing match after the numbers change |
| `server/scripts/rescoreMatches.js` | Recalculates every non-favourite match's score **and** range, without rematching |

---

## Part 1 - The presets

All of these live in `temperatureGroups.js`. The tables below show the
values at the time of writing; the file is the source of truth.

### 1.1 Groups and base ranges

| Top group | Subtypes |
|---|---|
| short | Short t-shirt, Vest, Croptop, Off-the-shoulder top, Linen shirt, Bodysuit, Fancy top, Party top, Tunic, Waistcoat |
| long | Long t-shirt, Buttondown shirt, Fancy blouse, Floaty blouse, Short turtleneck, Long turtleneck, Turtleneck, Light jumper, Light cardigan |

A Waistcoat (`OVER_ONLY_TOPS`) is short on its own - worn like a vest - but
with another top it's always the layer over it, never the innermost.
| warm | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan |

| Bottom group | Subtypes |
|---|---|
| short | Mini skirt, Maxi skirt and all shorts |
| lightLong | Smart and Midi skirts, Linen pants, Cropped trousers |
| long | All jeans (including Cropped jeans), Tailored trousers, Wide leg trousers, Chinos, Cargo pants, Leather trousers, Leggings, Sweatpants |

`BASE_RANGES` - a top group worn with a bottom group, no outer:

| | short bottoms | lightLong bottoms | long bottoms |
|---|---|---|---|
| **short tops** | 22–38 | 19–34 | 17–28 |
| **long tops** | 17–23 | 15–22 | 13–22 |
| **warm tops** | 15–22 | 9–18 | 5–16 |

### 1.2 Onepieces

`ONEPIECE_RANGES` gives each onepiece its own range (e.g. Summer dress
22–36, Jumpsuit 15–26, Winter dress 6–16).

### 1.3 Points

- `TOP_LAYER_POINTS` - how far a top moves the range down when it's an
  extra layer over the innermost top: short 1, long 4, warm 11 - but a
  warm top over a **long or warm** innermost top only
  `WARM_OVER_LONG_POINTS` (4). 11 takes a summer top's base down to the
  jumper rows; over a long-sleeve top it took a t-shirt + jumper + mini
  skirt + two outers to −1–6° (changed 2026-10-23).
- `ONEPIECE_LAYER_POINTS` - the same for tops worn with a onepiece:
  short 1, long 4, warm 5.
- `OUTER_WARMTH_POINTS` - how far each outer moves the range down (e.g.
  Blazer 2, Trench coat 4, Winter Coat 9, Puffer coat 11).

### 1.4 Minimums and caps

- `NO_OUTER_MIN_TEMP` (14) - with no outer, the minimum is never below
  this: colder than that needs a coat.
- `OUTER_MIN_TEMPS` - with **exactly one** outer, the minimum is never
  below that outer's value (e.g. Denim jacket 10, Puffer coat −10). Outfits
  with two outers use the lower of the two (the warmer coat's) - a blazer
  under a trench coat is floored at the trench's 6.
- `SKIRT_DRESS_MIN_TEMP` (7) - an outfit with a skirt or dress
  (`SKIRT_DRESS_SUBTYPES`: every skirt and dress subtype) is never below
  this, with any number of outers. It's the bare-legs floor, so with
  tights (Part 5) it goes down by the tights shift, to 5.
- `OUTER_CEILING_BASE` (25) - an outfit with outers is never suitable above
  this minus the outers' total points (23° with a blazer, 14° with a puffer
  coat).
- `OUTER_MIN_SPAN` (7) - an outfit with outers always covers at least this
  many degrees: the minimum is lowered to the capped maximum minus 7 if
  needed. Stops a light outfit under a jacket (vest + skirt + leather
  jacket) being squeezed into a 3° window by the ceiling above.
- `MIN_SPAN` (3) - every outfit covers at least this many degrees. Applied
  after the caps (end of step 5): a narrower range is widened **upwards**
  from its minimum. Narrow ranges come from the floors (a warm outfit lifted
  to 14° with no outer, or to its outer's minimum), so widening upwards
  keeps the floor exact - 14–14 becomes 14–17.
- `LAYERED_MAX_TEMPS` - the highest maximum for an outfit with a top worn
  as an extra layer, by the warmest layer's kind (`LAYER_KINDS`):
  **warmJumper** 18 (Hoodie/sweatshirt, Warm jumper, Turtleneck jumper,
  Warm cardigan), **lightJumper** 24 (Light jumper, Light cardigan),
  **other** 28 (any other top - a shirt over a t-shirt, a waistcoat, a
  blouse over a dress). Part 2, step 5.
- `LONG_BOTTOM_MAX_TEMP` (25) - the highest maximum for any outfit with a
  long bottom (Part 2, step 5).
- `TEMPERATURE_LIMITS` (−20 to 50) - the same bounds as the sliders.

### 1.5 The temperature preference

The style quiz asks "Do you generally feel too cold or too hot?", saved as
`preferences.temperature`. `TEMPERATURE_PREFERENCE_SHIFT` moves both ends of
the range: **cold +1**, normal 0, **hot −1**. The saved `min_temp`/`max_temp`
already include it. A missing preference counts as normal.

---

## Part 2 - The calculation

`computePresetTemperatureRange(items, temperaturePreference)`, step by step.
It reads only each item's `type` (role) and `subtype`.

### Step 1 - Base range

- **With a onepiece:** the onepiece's own range. (A user-built outfit with
  more than one uses the coldest.)
- **Otherwise:** `BASE_RANGES[innermost top group][warmest bottom group]`.
  The innermost top is the lightest one (short before long before warm),
  but never a Waistcoat while there's another top.
  With no top the "short" row is used; with no bottom the "long" column.

### Step 2 - Extra tops

- **Tops with a bottom:** every top other than the innermost moves the
  whole range down by its `TOP_LAYER_POINTS` - a warm top over a long
  or warm innermost top by `WARM_OVER_LONG_POINTS` instead.
- **Tops with a onepiece:** every top is an extra layer and moves the
  whole range down by its `ONEPIECE_LAYER_POINTS`.

Every extra layer also brings a maximum cap (step 5).

### Step 3 - Outers

The outers' `OUTER_WARMTH_POINTS` are added together. The whole range moves
down by that total, and the maximum is never above `OUTER_CEILING_BASE`
minus the total. The minimum is then lowered, if needed, so the range is
at least `OUTER_MIN_SPAN` wide (step 4's floor still applies after).

### Step 4 - Minimums

- No outer: the minimum is raised to `NO_OUTER_MIN_TEMP` if it's below it.
- One outer: raised to that outer's `OUTER_MIN_TEMPS` value.
- Two outers: raised to the lower of their two `OUTER_MIN_TEMPS` values.
- A skirt or dress: also raised to `SKIRT_DRESS_MIN_TEMP` (7). With one
  outer, the higher of the two floors wins - a blazer's 12 over the
  skirt's 7, the skirt's 7 over a duffle coat's 0.

If that lifts the minimum above the maximum, the maximum is raised to
match - the outfit becomes a single temperature rather than being rejected.

### Step 5 - Maximum caps

- **Layered tops:** with any extra layer (step 2), the maximum is never
  above `LAYERED_MAX_TEMPS` for the warmest layer - with several layers,
  the lowest cap wins. Short t-shirt + Light cardigan + Mini skirt is
  18–24, not 18–34. A single top has no layer cap.
- **Long bottom:** with a bottom from the "long" group, the maximum is
  never above `LONG_BOTTOM_MAX_TEMP` (25): Short t-shirt + Wide leg jeans
  is 17–25, not 17–28.

If the minimum is above a cap it's lowered to it. Coat outfits usually
already sit under these caps (step 3); the exception is a warm jumper under
a light outer, which the 18° cap brings lower.

### Step 6 - Preference

Both ends move by `TEMPERATURE_PREFERENCE_SHIFT`, and are kept within
`TEMPERATURE_LIMITS`. This comes after the caps, so a "cold" user's Short
t-shirt + Wide leg jeans is 18–26.

### Unknown subtypes

A subtype missing from the presets falls back to a middle value (a long top
or bottom, a 15–25 onepiece, a 5-point outer). It's reported in
`unknownSubtypes` (the reset script prints these) and caught by
`server/specs/presetTemperatureService.spec.js`.

### Worked example

Short t-shirt + Warm jumper + Denim jacket + Wide leg jeans, "cold"
preference, with the values above:

| Step | Range |
|---|---|
| 1. Base: short top (the t-shirt) + long bottom | 17–28 |
| 2. Warm jumper over a short top, −11 | 6–17 |
| 3. Denim jacket, −2 (maximum capped at 25 − 2 = 23), minimum kept 7° below the maximum | 4–15 |
| 4. One outer: minimum raised to the Denim jacket's 10 | 10–15 |
| 5. Caps: warm jumper layer 18, long bottom 25 - 15 is already under both | 10–15 |
| 6. "cold" +1 | **11–16** |

With a long t-shirt instead of the short one, step 1 is 13–22 and the
jumper only takes `WARM_OVER_LONG_POINTS` (4): 9–18, then 10–16 with the
jacket, **11–17** with "cold".

---

## Part 3 - When ranges are worked out

- **Automatic matches** (`processMatches`) and **user-built matches**
  (`createMatch`) both get their range from `describeOutfit`, with the
  user's preference from `getUserMatchingPreferences`.
- **Temperature never rejects an outfit.** Every combination has a range.
- **Editing a match by hand:** the match card
  (`src/components/matches/viewMatchesCard.jsx`) can still change a match's
  range directly. It's saved as it is and never recalculated - except by
  the reset script below.
- **Changing the numbers or the preference later:** existing matches keep
  their ranges. Run
  `node server/scripts/resetMatchTemperatures.js --dry-run` to preview, then
  without `--dry-run` (optionally `--backup <file>`) to recalculate every
  match. This also overwrites hand-edited ranges.

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
     and max - up to **1.5°** beyond the day or **2°** inside it (10–20°
     takes minimums 8.5–12 and maximums 18–22) - **or** covers all of the day (`min_temp <= min`
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
  and max (1.5° beyond or 2° inside - `CLOSE_MATCH_OUTSIDE` /
  `CLOSE_MATCH_INSIDE`), or its range
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
from Part 1 step 4 (14° with no outer, the outer's minimum, and for a
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
- a warm top (the "warm" top group) or **any** outer.

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
| Which group a top/bottom is in | `TOP_GROUPS` / `BOTTOM_GROUPS` |
| Top + bottom ranges | `BASE_RANGES` |
| Onepiece ranges | `ONEPIECE_RANGES` |
| Extra top layers | `TOP_LAYER_POINTS`, `WARM_OVER_LONG_POINTS`, `ONEPIECE_LAYER_POINTS`, `OVER_ONLY_TOPS` |
| Outer warmth | `OUTER_WARMTH_POINTS` |
| Minimum with no outer / one outer | `NO_OUTER_MIN_TEMP` / `OUTER_MIN_TEMPS` |
| Minimum for a skirt or dress | `SKIRT_DRESS_MIN_TEMP`, `SKIRT_DRESS_SUBTYPES` |
| Warmest day for an outfit with outers | `OUTER_CEILING_BASE` |
| Narrowest range for an outfit with outers | `OUTER_MIN_SPAN` |
| Narrowest range for any outfit | `MIN_SPAN` |
| Highest maximum with layered tops / which tops count as jumpers | `LAYERED_MAX_TEMPS` / `LAYER_KINDS` |
| Preference shift | `TEMPERATURE_PREFERENCE_SHIFT` |
| Highest maximum with a long bottom | `LONG_BOTTOM_MAX_TEMP` |
| Today's weather tiers and cap | `CLOSE_MATCH_OUTSIDE` / `CLOSE_MATCH_INSIDE` / `FULL_COVERAGE` / `PARTIAL_COVERAGE_STEPS` / `TODAY_OUTFIT_LIMIT` in `server/constants/todayOutfits.js` |
| Daytime hours for today's weather | `core/constants/daytimeHours.js` |
| Tights shift / which skirts, dresses and shorts are asked about, and their defaults | `shared/tights.json` (`askBySubtype`; then run the reset script so `tights` flags follow) |

After changing them, restart the server and run the reset script (Part 3)
so existing matches follow.

Tests: `server/specs/presetTemperatureService.spec.js` (the rules, written
against the constants so they keep passing when numbers are tuned) and
`server/specs/temperatureService.spec.js` (today matching). Run them with
`cd server && node --test specs/*.spec.js`.
