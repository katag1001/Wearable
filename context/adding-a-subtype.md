# Adding a new clothing subtype

A checklist of every place that needs changing when a new subtype (e.g.
"Turtleneck jumper", "Fancy top") is added. Nothing else in the app needs
touching - matching, colour, pattern, temperature, filters and the clothes
page all work off these lists.

First decide:

- **Which genders** get it - `woman`, `unisex` and/or `man`.
- **Its role** - `top`, `bottom`, `onepiece` or `outer`.
- **Which existing subtype it's closest to** - copying that subtype's
  scores and defaults is the easiest starting point.
- **Its defaults** - category and tags.
- **Its temperature preset** - which temperature group it's in (section 6).

---

## 1. `shared/subtypesByGender.json` - the master list (required)

Each gender has one list per role:

```json
"woman": {
  "top": ["Hoodie/sweatshirt", "..."],
  "bottom": ["..."],
  "onepiece": ["..."],
  "outer": ["..."]
}
```

Add the name to the right role list for each gender it belongs to.

- **Position matters.** The gender's matrix file must list its subtypes in
  exactly this order: all tops, then bottoms, then onepieces, then outers.
  Put it next to the subtype it's most similar to.
- `server/constants/matchScoreBaseline.js` reads the roles from here to
  check the matrix (section 2). No change is needed there.

## 2. `server/constants/matrices/<gender>.js` - the score matrices (required)

One file per gender: `man.js`, `woman.js`, `unisex.js`. In each file for a
gender the subtype is added to:

1. Add the name to `subtypes`, at the **same position** as in
   `subtypesByGender.json`.
2. Add a **new row** to `scores` at that position, with one cell per
   subtype, and a trailing `// <Subtype name>` comment.
3. Add a **new column**: one extra cell, at that position, in **every
   existing row**.

Each cell is either a **score from 0 to 90** (whole number,
`MAX_BASELINE_SCORE` in `server/constants/scoring.js` - personal
adjustments can take a pair above it, the baseline can't) or **`null`**
(never matched). The server refuses to start unless:

- the grid is **symmetric**: `scores[i][j]` equals `scores[j][i]`;
- the subtype **paired with itself is `null`**;
- **two bottoms, two onepieces, or a bottom with a onepiece are `null`**;
- **top+bottom, top+outer, bottom+outer and onepiece+outer have a score**.
  These always match, and the score only decides how good the match is;
- **top+top, outer+outer and top+onepiece** may be either. This is where
  "can these be worn together at all" is decided.

`0` is a valid score (a poor match), not "never".

Tip: copy the row and column of the closest existing subtype, then adjust
the specific pairs that should differ. Doing this with a small Node script
is far less error-prone than hand-editing 60+ cells per row:

1. `require` the matrix and turn it into a pair map (`score[a][b]`).
2. Update `shared/subtypesByGender.json` first (the script can do it), so
   the new order is known.
3. For each new subtype, copy the template's value for every other subtype,
   then apply the overrides. Keep the fixed `null` pairs (two bottoms, two
   onepieces, a bottom with a onepiece, itself) and cap at 90.
4. Add subtypes one at a time. Each new one then copies the template's
   score with the subtypes added before it, so new + new pairs get a value.
5. Rebuild `subtypes` and `scores` in the order from the JSON, keep the
   header comment, and write the file back.
6. Check it with `node -e "require('./server/constants/matchScoreBaseline.js')"`.
   This runs the same checks as server start-up.

The same script approach works for `core/constants/typeOptions.js` (section
3) and `shared/footwearMatrices.json` (section 7). Keep each file's
existing formatting so the diff only shows the real changes.

## 3. `core/constants/typeOptions.js` - the frontend options (required)

Add one entry per gender, in the same shape as the others:

```js
{
  "type": "top",
  "category": "Tops",
  "name": "Fancy top",
  "tags": ["Work", "Party", "Dinner", "Formal", "Date night", "Everyday"]
}
```

- `name` must match `subtypesByGender.json` **exactly** (case, spacing,
  hyphens). This file is not linked to that one automatically. Keep the
  entries in the same order too.
- `type` must match the role list it's in, in `subtypesByGender.json`.
- `category` is the group shown in the subtype picker
  (`src/components/clothes/uploadComponents/modalOne.jsx`). Use an
  existing category name unless a new group is genuinely wanted.
- `tags` are the **automatic defaults**
  filled in by addUpdateClothes when the user clicks Next - see
  `src/components/clothes/uploadComponents/useClothingDetection.jsx`.
  No code change is needed for these to work.

## 4. `core/clothes/uploadHelpers.js` - name suggestions (optional)

Add an entry to `SUBTYPE_SYNONYMS` (lowercase key = subtype name) with
other words people might type, so the picker suggests it:

```js
"turtleneck jumper": ["polo neck jumper", "roll neck jumper", "turtleneck sweater"],
```

Without an entry, it still matches on the words in its own name.

## 5. `server/constants/requiresLayering.js` - single-item rules (only if applicable)

- `REQUIRES_LAYERING`: a top or outer that can **never be the only item
  in its role** (e.g. a cardigan that always needs a top underneath).
- `REQUIRES_TOP`: a onepiece that must **always be worn with a top** (e.g.
  Overalls).
- `REQUIRES_OUTER`: anything that must **always be worn with an outer**
  (e.g. Ski/snow pants) - never matched, automatically or by hand,
  without one.

Add it to the relevant gender lists. Make sure the matrix gives it at
least one compatible partner of the right kind, or it can never be
matched. `server/specs/matchScoreBaseline.spec.js` checks this.

## 6. `server/constants/temperatureGroups.js` - temperature preset (required)

Clothing items have no temperature range; a match's range comes from its
subtypes (see `temperature-ranges.md`). Add the new subtype to:

- a top: one of `TOP_LEVELS` (1 summer ... 5 warm);
- a bottom: one of `BOTTOM_LEVELS` (1 short ... 5 warm);
- if its level already assumes a fabric (a linen or wool one, say):
  `FABRIC_NAMED_SUBTYPES`, so that fabric doesn't count twice;
- if it should never be worn above a temperature (like turtlenecks):
  `SUBTYPE_MAX_TEMPS`;
- a onepiece: `ONEPIECE_RANGES`, with its own `[min, max]`;
- an outer: both `OUTER_WARMTH_POINTS` and `OUTER_MIN_TEMPS`.

`server/specs/presetTemperatureService.spec.js` fails if any subtype in
`subtypesByGender.json` is missing here. Then run
`node server/scripts/rematchAll.js --confirm` if existing matches should
pick it up (outfits you've interacted with keep their ranges).

## 7. The other per-subtype lists (required where they apply)

- `server/constants/analysisDefinitions.js` - `SUBTYPE_DEFINITIONS`: what
  the photo analysis (Gemini) is told the subtype looks like. Every subtype
  needs one, and neighbouring subtypes' definitions should point to it
  where they could be confused ("strapless is Tube top"). Then bump
  `PROMPT_VERSION` in `server/constants/itemAnalysis.js`, so analyses from
  the old and new wording can be told apart.
- `shared/footwearMatrices.json` - bottoms and onepieces only: a row of
  footwear scores per gender (copy the closest subtype's row), in the same
  order as `subtypesByGender.json`. Check it with
  `node -e "require('./server/constants/footwearScoreBaseline.js')"`.
- `server/constants/outerTags.js` - outers only: `TAGGED_OUTERS` if it's
  part of the look (a blazer, a bolero - its occasion tags count) or
  `UNTAGGED_OUTERS` if it's just worn over the top (a coat). Every outer
  must be in exactly one (`helpers.spec.js`).
- `shared/tights.json` - skirts, dresses and shorts only: whether the
  "Would you wear this with tights?" question defaults to yes.
- `server/constants/temperatureGroups.js` - also `SKIRT_DRESS_SUBTYPES`
  for a skirt or dress (section 6 covers the rest of this file).
- `server/constants/pairingQuestions.js` - the subtype in any style-quiz
  question about similar pieces (e.g. `LAYERING_DRESSES`, `SHIRTS`).
- `server/constants/seasonality.js` - `SEASON_NAMED_SUBTYPES`, only if the
  name itself says a season (e.g. "Summer dress").

---

## After the change

1. Run the server tests: `cd server && node --test specs/*.spec.js`.
2. Restart the server - the matrices are read and checked once on start.
3. Rebuild the frontend (`npx vite build`) if deploying - `dist/` is a
   built copy.
4. Existing users keep their personal score adjustments (`matchscores`
   collection) - new pairs simply have none yet. Existing matches are not
   regenerated; new matches appear when a clothing item is added or
   edited.

## Renaming or removing a subtype

Same files (including `temperatureGroups.js` and any `SUBTYPE_SYNONYMS`
key), plus:

- Existing clothes with the old name keep it in the database - they will
  no longer match a matrix row. Update them in the `clothes` collection.
- Personal adjustments in `matchscores` store the subtype names
  (`subtypeA` / `subtypeB`, in alphabetical order) and need updating too -
  re-sorting the pair if the new name sorts differently.
- Trends (`Trend` collection, edited on the web /trends page) store
  subtype names in `pieces[].subtype` and need the same rename.
- Matches only store clothing ids, so they need no change.
- Specs that use **real** constants (`presetTemperatureService.spec.js`,
  `tightsService.spec.js`, `outfitTemperatureRefreshService.spec.js`)
  need the new name. Specs that build their own baseline can keep any
  name.
- The photo-analysis test set (`server/scripts/reports/gold-standard-items.json`)
  labels items by subtype. Re-label the affected items there, or the
  scorer counts them as misses.

Do this with a one-off script in `server/scripts/` that connects with
`MONGO` from `server/.env` (like the scripts there), then delete it once
it's been run:

- **Rename:** `Clothes.updateMany({ subtype: OLD }, { $set: { subtype: NEW } })`,
  then for each `MatchScore` with `OLD` as `subtypeA` or `subtypeB`, swap
  in `NEW` and re-sort the pair with `canonicalPairKey`
  (`services/matrixService.js`). Pairs are unique per user, so when
  **several old names merge into one**, a renamed pair can clash with one
  the user already has. Keep the existing one and delete the old one.
  Also update `Trend` pieces.
- **Removing a subtype for one gender:** find that gender's users in
  `Preferences`, and switch their items with the old subtype to the
  closest remaining one.

Keeping the old spelling as a `SUBTYPE_SYNONYMS` entry means typing it
still suggests the subtype.
