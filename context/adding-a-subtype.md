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
- **Its defaults** - category, seasons, tags.
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

Each cell is either a **score from 0 to 100** (whole number) or **`null`**
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
(read the file with `require`, rebuild the `subtypes` and `scores` blocks,
write it back) is far less error-prone than hand-editing 60+ cells per
row.

## 3. `src/constants/typeOptions.jsx` - the frontend options (required)

Add one entry per gender, in the same shape as the others:

```js
{
  "type": "top",
  "category": "Tops",
  "name": "Fancy top",
  "season": ["Spring", "Summer", "Autumn", "Winter"],
  "tags": ["Work", "Party", "Dinner", "Wedding", "Date night", "Everyday"]
}
```

- `name` must match `subtypesByGender.json` **exactly** (case, spacing,
  hyphens). This file is not linked to that one automatically.
- `type` must match the role list it's in, in `subtypesByGender.json`.
- `category` is the group shown in the subtype picker
  (`src/components/clothes/uploadComponents/modalOne.jsx`). Use an
  existing category name unless a new group is genuinely wanted.
- `season` and `tags` are the **automatic defaults**
  filled in by addUpdateClothes when the user clicks Next - see
  `src/components/clothes/uploadComponents/useClothingDetection.jsx`.
  No code change is needed for these to work.

## 4. `src/components/clothes/uploadComponents/uploadHelpers.jsx` - name suggestions (optional)

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

Add it to the relevant gender lists. Make sure the matrix gives it at
least one compatible partner of the right kind, or it can never be
matched. `server/specs/matchScoreBaseline.spec.js` checks this.

## 6. `server/constants/temperatureGroups.js` - temperature preset (required)

Clothing items have no temperature range; a match's range comes from its
subtypes (see `temperature-ranges.md`). Add the new subtype to:

- a top: one of `TOP_GROUPS` (short / long / warm);
- a bottom: one of `BOTTOM_GROUPS` (short / lightLong / long);
- a onepiece: `ONEPIECE_RANGES`, with its own `[min, max]`;
- an outer: both `OUTER_WARMTH_POINTS` and `OUTER_MIN_TEMPS`.

`server/specs/presetTemperatureService.spec.js` fails if any subtype in
`subtypesByGender.json` is missing here. Then run
`node server/scripts/resetMatchTemperatures.js` if existing matches should
pick it up.

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

Same files, plus:

- Existing clothes with the old name keep it in the database - they will
  no longer match a matrix row. Update them in the `clothes` collection
  (see `server/scripts/matchingOverhaulMigration.js` for an example).
- Personal adjustments in `matchscores` store the subtype names
  (`subtypeA` / `subtypeB`) and need updating or deleting too.
