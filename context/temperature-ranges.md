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
5. The user's **temperature preference** shifts the whole range.
6. Any outfit with a **long bottom** is capped at a maximum of 25° - the
   last step, after everything else.

Files:

| File | Role |
|---|---|
| `server/constants/temperatureGroups.js` | **Every number** - groups, base ranges, onepiece ranges, points, minimums, caps, preference shift |
| `server/services/presetTemperatureService.js` | The rules that combine them (`computePresetTemperatureRange`) |
| `server/services/outfitEvaluator.js` | `describeOutfit` calls it for every new match |
| `server/services/temperatureService.js` | Matching a saved range against today's weather |
| `server/scripts/resetMatchTemperatures.js` | Recalculates every existing match after the numbers change |

---

## Part 1 - The presets

All of these live in `temperatureGroups.js`. The tables below show the
values at the time of writing; the file is the source of truth.

### 1.1 Groups and base ranges

| Top group | Subtypes |
|---|---|
| short | Short t-shirt, Vest, Croptop, Off-the-shoulder top, Linen shirt, Bodysuit, Fancy top, Tunic |
| long | Long t-shirt, Buttondown shirt, Fancy blouse, Floaty blouse, Short turtleneck, Long turtleneck, Turtleneck, Waistcoat, Light jumper, Light cardigan |
| warm | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan |

| Bottom group | Subtypes |
|---|---|
| short | Mini skirt and all shorts |
| lightLong | Maxi, Knee-length, Midi and Low waist midi skirts, Linen pants, Cropped trousers |
| long | All jeans (including Cropped jeans), Tailored trousers, Wide leg trousers, Chinos, Cargo pants, Leather trousers, Leggings, Sweatpants |

`BASE_RANGES` - a top group worn with a bottom group, no outer:

| | short bottoms | lightLong bottoms | long bottoms |
|---|---|---|---|
| **short tops** | 22–38 | 19–34 | 17–28 |
| **long tops** | 18–27 | 15–25 | 13–22 |
| **warm tops** | 12–19 | 9–18 | 5–16 |

### 1.2 Onepieces

`ONEPIECE_RANGES` gives each onepiece its own range (e.g. Summer dress
22–36, Jumpsuit 15–26, Winter dress 6–16).

### 1.3 Points

- `TOP_LAYER_POINTS` - how far a top moves the range down when it's an
  extra layer: short 1, long 4, warm 11.
- `OUTER_WARMTH_POINTS` - how far each outer moves the range down (e.g.
  Blazer 2, Trench coat 4, Winter Coat 9, Puffer coat 11).

### 1.4 Minimums and caps

- `NO_OUTER_MIN_TEMP` (14) - with no outer, the minimum is never below
  this: colder than that needs a coat.
- `OUTER_MIN_TEMPS` - with **exactly one** outer, the minimum is never
  below that outer's value (e.g. Denim jacket 10, Puffer coat −10). Outfits
  with two outers have no minimum.
- `OUTER_CEILING_BASE` (25) - an outfit with outers is never suitable above
  this minus the outers' total points (23° with a blazer, 14° with a puffer
  coat).
- `OUTER_LAYER_OVERLAP` (4) - a long or warm top over a onepiece (a
  cardigan over a dress) caps the maximum this far above the onepiece's own
  minimum.
- `LONG_BOTTOM_MAX_TEMP` (25) - the highest saved maximum for any outfit
  with a long bottom (Part 2, step 6).
- `TEMPERATURE_LIMITS` (−20 to 50) - the same bounds as the sliders.

### 1.5 The temperature preference

The style quiz asks "Do you generally feel too cold or too hot?", saved as
`preferences.temperature`. `TEMPERATURE_PREFERENCE_SHIFT` moves both ends of
the range: **cold +2**, normal 0, **hot −2**. The saved `min_temp`/`max_temp`
already include it. A missing preference counts as normal.

---

## Part 2 - The calculation

`computePresetTemperatureRange(items, temperaturePreference)`, step by step.
It reads only each item's `type` (role) and `subtype`.

### Step 1 - Base range

- **With a onepiece:** the onepiece's own range. (A user-built outfit with
  more than one uses the coldest.)
- **Otherwise:** `BASE_RANGES[innermost top group][warmest bottom group]`.
  The innermost top is the lightest one (short before long before warm).
  With no top the "short" row is used; with no bottom the "long" column.

### Step 2 - Extra tops

- **Tops with a bottom:** every top other than the innermost moves the
  whole range down by its `TOP_LAYER_POINTS`.
- **Tops with a onepiece:** a short top (a t-shirt under overalls) moves
  the whole range down. A long or warm top is a cover-up: it moves the range
  down and caps the maximum `OUTER_LAYER_OVERLAP` above the onepiece's own
  minimum.

### Step 3 - Outers

The outers' `OUTER_WARMTH_POINTS` are added together. The whole range moves
down by that total, and the maximum is never above `OUTER_CEILING_BASE`
minus the total.

### Step 4 - Minimums

- No outer: the minimum is raised to `NO_OUTER_MIN_TEMP` if it's below it.
- Exactly one outer: raised to that outer's `OUTER_MIN_TEMPS` value.
- Two outers: no minimum.

If that lifts the minimum above the maximum, the maximum is raised to
match - the outfit becomes a single temperature rather than being rejected.

### Step 5 - Preference

Both ends move by `TEMPERATURE_PREFERENCE_SHIFT`, and are kept within
`TEMPERATURE_LIMITS`.

### Step 6 - Long-bottom cap

If the outfit has a bottom from the "long" group, its saved maximum is
never above `LONG_BOTTOM_MAX_TEMP` (25). This is applied last, after the
preference shift, so it's the real saved value: Short t-shirt + Wide leg
jeans is 17–25 (19–25 for "cold"), not 17–28. If the minimum were above 25
it would be lowered to 25. Outfits without a long bottom are untouched.

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
| 2. Warm jumper over it, −11 | 6–17 |
| 3. Denim jacket, −2 (maximum capped at 25 − 2 = 23) | 4–15 |
| 4. One outer: minimum raised to the Denim jacket's 10 | 10–15 |
| 5. "cold" +2 | 12–17 |
| 6. Long-bottom cap: 17 is already under 25 | **12–17** |

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

1. `src/components/today/autoWeather.jsx` gets today's min/max from
   Open-Meteo (cached for the day in `localStorage`). It works out the
   season from the month (northern hemisphere) and posts all three to
   `/today/create`.
2. The `createToday` controller keeps matches that are marked for today's
   season **and** pass `matchesTodayTemperature`: at least **50%** of the
   match's own range (`MIN_TODAY_OVERLAP_FRACTION`) must fall within
   today's min–max. A single-temperature match (e.g. 12–12) passes if that
   temperature is within today's range.
3. `src/components/today/todayOutfitSort.jsx` sorts what's left.
   Temperature counts for 10% of the score: the score goes down for every
   degree today goes outside the match's range, and matches with an outer
   lose 1 point.

### 4.2 Filters

- **Matches page:** the temperature filter keeps any match whose range
  **overlaps** the chosen range at all (`src/pages/Matches.jsx`).
- **Clothes page:** no temperature filter - items have no range
  (`showTemperature={false}` on the shared `Filter`).

---

## Changing the numbers

| What | Where (`server/constants/temperatureGroups.js` unless stated) |
|---|---|
| Which group a top/bottom is in | `TOP_GROUPS` / `BOTTOM_GROUPS` |
| Top + bottom ranges | `BASE_RANGES` |
| Onepiece ranges | `ONEPIECE_RANGES` |
| Extra top layers | `TOP_LAYER_POINTS` |
| Outer warmth | `OUTER_WARMTH_POINTS` |
| Minimum with no outer / one outer | `NO_OUTER_MIN_TEMP` / `OUTER_MIN_TEMPS` |
| Warmest day for an outfit with outers | `OUTER_CEILING_BASE` |
| Cardigan-over-dress cap | `OUTER_LAYER_OVERLAP` |
| Preference shift | `TEMPERATURE_PREFERENCE_SHIFT` |
| Highest maximum with a long bottom | `LONG_BOTTOM_MAX_TEMP` |
| Today overlap threshold | `MIN_TODAY_OVERLAP_FRACTION` in `server/services/temperatureService.js` |

After changing them, restart the server and run the reset script (Part 3)
so existing matches follow.

Tests: `server/specs/presetTemperatureService.spec.js` (the rules, written
against the constants so they keep passing when numbers are tuned) and
`server/specs/temperatureService.spec.js` (today matching). Run them with
`cd server && node --test specs/*.spec.js`.
