# How temperature ranges work

Every clothing item and every match (outfit) stores a temperature range:
`min_temp` and `max_temp`, in °C. This explains where each one comes from,
and how a match's range is then used.

In short:

1. A **clothing item's** range is the subtype's default range. It is
   shifted 1° for the user's temperature preference, and the user can then
   adjust it by hand. It is stored as it is.
2. A **match's** range is always calculated on the server from its items'
   ranges, by `computeTemperatureRange` in
   `server/services/temperatureService.js`. The client never supplies it.

---

## The temperature preference

The style quiz asks "Do you generally feel too cold or too hot?". The
answer is saved as `preferences.temperature`:

| Answer | Value | Effect |
|---|---|---|
| Too cold | `"cold"` | Needs warmer days for the same clothes |
| Normal | `"normal"` | No adjustment |
| Too hot | `"hot"` | Can wear the same clothes on colder days |

If the preference is missing, it's treated as `"normal"`
everywhere. It's used in two places: shifting the defaults of new clothing
items (part 1), and the no-outer minimum for matches (part 2, step 4).

The quiz options are in `src/constants/styleQuizOptions.js`
(`temperatureQuestionOptions`). The saved field is in
`server/models/AllModels.js` (`preferences.temperature`).

---

## Part 1 - Clothing items

### 1.1 The subtype defaults

Each subtype in `src/constants/typeOptions.jsx` has a `minTemp` and
`maxTemp`. They're defined separately for each gender (`man`, `woman`,
`unisex`). For example, a man's "Short t-shirt" is 15–35 and a "Puffer
coat" is −15–5.

**What an item's range means:** "this item can be **part of** an outfit
at these temperatures". Warm bases like jeans or long-sleeved tops can have
very low minimums because they're expected to be worn **under** other
layers. They don't mean the item can be worn on its own at that
temperature. The match calculation (part 2) accounts for this.

The backend never reads these defaults. Once an item is saved, its own
`min_temp`/`max_temp` are the only values used.

### 1.2 Adding a new item

Files: `src/components/clothes/addUpdateClothes.jsx`,
`uploadComponents/useClothingDetection.jsx`,
`uploadComponents/useClothingForm.jsx`, `uploadComponents/uploadHelpers.jsx`.

1. When the form opens, it fetches `/preferences` once to get the user's
   `gender` (which decides which subtype list is used) and `temperature`.
2. On page one the user picks a name and a subtype.
3. When they click **Next**, `applyDetection` fills in page two. The range
   becomes:
   - the subtype's `minTemp`/`maxTemp`, or **10–20** if no subtype
     matches (`getInitialState`);
   - **shifted** by `shiftTempForPreference`: "cold" adds 1° to both min
     and max, "hot" subtracts 1° from both, "normal" leaves it alone. The
     whole range moves rather than narrowing.
4. If the user then moves the temperature slider,
   `manualTempOverride` is set and the defaults are never applied again
   for this item. That includes going Back and picking another subtype.
5. Going Back and clicking Next again without changing the name or
   subtype doesn't overwrite anything on page two.
6. The item is saved with `min_temp`/`max_temp` as numbers. Both are
   required in the `Clothes` schema.

Example: a man who feels the cold adds a Short t-shirt. The default 15–35
is saved as **16–36**, unless he moves the slider.

### 1.3 Editing an existing item

**Nothing is auto-filled when editing.** `applyDetection` returns
immediately for an existing item, so only the fields the user actually
changes are saved. Renaming an item, or changing its subtype, leaves its
range, seasons, tags and colours as they were. A subtype change still
updates `type`, which matching needs.

The temperature preference is also **not** re-applied when editing, or
when the preference is changed later. It only affects the defaults of
items added afterwards.

Editing an item's range doesn't update matches that already exist. Only
new matches found when the item is saved use the new range.

### 1.4 The slider

`src/components/general/temperatureSlider.jsx` is a two-thumb slider from
−20 to 50 on the item form. The thumbs can't cross (min ≤ max).

---

## Part 2 - Matches

### 2.1 Where a match's range is calculated

There's one function, `computeTemperatureRange(items, { isUserMade,
temperaturePreference })`. It's called through `describeOutfit`
(`server/services/outfitEvaluator.js`) from both places matches are
created:

| Match source | Caller | `isUserMade` |
|---|---|---|
| Found automatically when an item is added/edited | `processMatches` → `findCandidateMatches` (`server/services/matchService.js`) | `false` |
| Built by the user on the Build Matches page | `createMatch` controller (`server/controllers/allControllers.js`) | `true` |

In both cases the user's temperature preference is loaded with
`getUserMatchingPreferences` (`server/services/matchScoreService.js`).

The Build Matches page (`src/components/matches/createMatch.jsx`) sends
**only the clothing ids**. Temperature, seasons, colours, tags and role
counts are all worked out on the server from the items themselves.

Automatic matching builds every outfit shape from scratch each time an
item is saved: with no outer, one outer and two outers (see
`server/constants/outfitShapes.js`). It doesn't extend existing matches.
Each shape gets its own range, worked out independently.

### 2.2 The calculation, step by step

Items are split into **tops**, **bottoms/onepieces**, and **outers**.

#### Step 1 - Combine the tops as layers

Tops are layers, so they combine rather than intersect:

- **floor** = the lowest `min_temp` of any top (the warmest layer decides
  how cold you can go)
- **ceiling** = the highest `max_temp` of any top (a layer can always come
  off, so adding one never lowers the ceiling)

Two tops therefore never conflict on temperature. Whether two tops can be
worn together at all is decided by the matrix scores, not by temperature.

#### Step 2 - Intersect with the bottom/onepiece to get the base range

The combined tops range is intersected with the bottom or onepiece:

- base floor = the **highest** of their floors
- base ceiling = the **lowest** of their ceilings

A onepiece on its own just uses its own range.

#### Step 3 - If the base doesn't overlap

If the base floor is above the base ceiling, the items have no
temperature in common:

- **Automatic match:** rejected (`null`). Nothing else is checked, and it
  isn't saved.
- **User-made match:** never rejected. The base becomes the **union** of
  every top/bottom/onepiece instead (lowest `min_temp` to highest
  `max_temp`).

#### Step 4 - Work out the floor

**With at least one outer:** the floor is **replaced** by the coldest
outer's own `min_temp`. With **two** outers, it drops a further
**4°** (`EXTRA_OUTER_PENALTY`). The no-outer minimums below don't apply.

**With no outer:** item minimums assume layers on top (see 1.1), so the
floor is **raised** to at least a minimum based on the number of layers
and the user's preference (`NO_OUTER_MIN_TEMP`):

| Layers (tops + onepiece) | Too hot | Normal | Too cold |
|---|---|---|---|
| 1 (one top + bottom, or a onepiece alone) | 13 | 14 | 15 |
| 2 (two tops + bottom, or a top over a onepiece) | 11 | 12 | 13 |

If the base floor is already above this minimum, it's kept as it is.

#### Step 5 - The ceiling

The ceiling is always the base ceiling from step 2 (or step 3). Outers
never change it, and neither do extra layers.

#### Step 6 - Collapse instead of rejecting

If step 4 pushed the floor above the ceiling, the floor is set to the
ceiling. The match becomes a single temperature (e.g. 12–12). This
applies to automatic and user-made matches alike. These outfits are kept,
never rejected.

#### Step 7 - Stored

`describeOutfit` rounds both values to one decimal place and stores them
on the match as `min_temp`/`max_temp`.

### 2.3 Worked examples

Men's default ranges. "Normal" preference unless stated.

| Outfit | Steps | Range |
|---|---|---|
| T-shirt (15–35) + jeans (5–22) | base 15–22; floor 15 is already above 14 | **15–22** |
| T-shirt (15–35) + warm jumper (−5–12) + jeans (5–22) | tops −5–35; base 5–22; 2 layers → floor raised to 12 | **12–22** |
| Same, "too cold" preference | 2 layers, cold → floor 13 | **13–22** |
| Same + puffer coat (−15–5) | outer replaces the floor → −15 | **−15–22** |
| Long-sleeve (−2–20) + jeans (−2–22) | base −2–20; 1 layer → floor raised to 14 | **14–20** |
| Long-tshirt (12–22) + leather trousers (0–15) | base 12–15; floor raised to 14 | **14–15** |
| Warm jumper (−5–12) + leather trousers (0–15) | base 0–12; floor 14 is above the ceiling → collapsed | **12–12** |
| Summer dress (22–35) alone | 1 layer; floor 22 is already above 14 | **22–35** |
| Winter dress (0–15) + warm cardigan (0–15) | top over onepiece = 2 layers → floor 12 | **12–15** |
| T-shirt + jeans + jacket (8–18) + puffer (−15–5) | coldest outer −15, two outers −4 | **−19–22** |
| Linen shirt (18–35) + leather trousers (0–15), automatic | base doesn't overlap | **rejected** |
| Same, user-made | union 0–35; 1 layer → floor 14 | **14–35** |

### 2.4 After a match is created

- **Editing a match by hand:** the match card
  (`src/components/matches/viewMatchesCard.jsx`) lets the user change a
  match's range directly. The new values are saved as they are and never
  recalculated.
- **Changing the preference later:** existing matches keep their ranges.
  Only matches created afterwards use the new preference.

---

## Part 3 - Where match ranges are used

### 3.1 Today's outfits

1. `src/components/today/autoWeather.jsx` gets today's min/max from
   Open-Meteo (cached for the day in `localStorage`). It works out the
   season from the month (northern hemisphere) and posts all three to
   `/today/create`.
2. The `createToday` controller keeps matches that are marked for
   today's season **and** pass `matchesTodayTemperature`: at least **50%**
   of the match's own range (`MIN_TODAY_OVERLAP_FRACTION`) must fall within
   today's min–max. A single-temperature match (e.g. 12–12) passes if
   that temperature is within today's range.
3. `src/components/today/todayOutfitSort.jsx` sorts what's left.
   Temperature counts for 10% of the score: the score goes down for every
   degree today goes outside the match's range, and matches with an outer
   lose 1 point.

### 3.2 Filters

On the Clothes and Matches pages, the temperature filter keeps anything
whose range **overlaps** the chosen range at all (`src/pages/Clothes.jsx`,
`src/pages/Matches.jsx`).

---

## Changing the numbers

| What | Where |
|---|---|
| Subtype default ranges | `src/constants/typeOptions.jsx` (`minTemp`/`maxTemp`) |
| ±1° shift for new items | `TEMPERATURE_PREFERENCE_OFFSET` in `src/components/clothes/uploadComponents/uploadHelpers.jsx` |
| Minimum floor without an outer | `NO_OUTER_MIN_TEMP` in `server/services/temperatureService.js` |
| Extra drop for a second outer | `EXTRA_OUTER_PENALTY` in `server/services/temperatureService.js` |
| Today overlap threshold | `MIN_TODAY_OVERLAP_FRACTION` in `server/services/temperatureService.js` |

Tests for the match calculation are in
`server/specs/temperatureService.spec.js`. Run them with
`node --test server/specs/*.js`.
