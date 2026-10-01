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
- **Its defaults** - category, seasons, tags, min/max temperature.

---

## 1. `shared/subtypesByGender.json` - the master list (required)

Add the name to each gender list it belongs to.

- **Position matters.** Every matrix file for that gender must list its
  subtypes in exactly this order. Put it next to the subtype it's most
  similar to.
- `server/constants/matchScoreBaseline.js` checks this on server start and
  throws if a matrix and this list disagree - no change needed there.

## 2. `server/constants/matrices/<gender>-<style>.js` - the score matrices (required)

One file per gender + style combination:

| Gender | Files |
|---|---|
| woman | `woman-classic.js`, `woman-fashion.js`, `woman-fun.js` |
| unisex | `unisex-classic.js`, `unisex-fashion.js`, `unisex-fun.js` |
| man | `man-all.js` |

In **every** file for each gender the subtype is added to:

1. Add the name to `subtypes`, at the **same position** as in
   `subtypesByGender.json`.
2. Add a **new row** to `scores` at that position, with one score per
   subtype, and a trailing `// <Subtype name>` comment.
3. Add a **new column** - one extra score, at that position, in **every
   existing row**.

Rules the scores must follow (enforced by
`server/specs/matchScoreBaseline.spec.js`):

- **Symmetric** - `scores[i][j]` must equal `scores[j][i]`. The new row and
  the new column must hold the same values.
- **Self-pair is -20** - the new subtype paired with itself.
- A pair can match only when its score is **above 0**. Typical scale:
  `-20` never, `-15` / `-10` strongly no, `0`–`9` normal, `15`–`20` great.

Tip: copy the row and column of the closest existing subtype, then adjust
the specific pairs that should differ. Doing this with a small Node script
(read the file with `require`, rebuild the `subtypes` and `scores` blocks,
write it back) is far less error-prone than hand-editing 60+ numbers per
row.

## 3. `src/constants/typeOptions.jsx` - the frontend options (required)

Add one entry per gender, in the same shape as the others:

```js
{
  "type": "top",
  "category": "Tops",
  "name": "Fancy top",
  "season": ["Spring", "Summer", "Autumn", "Winter"],
  "tags": ["Work", "Party", "Dinner", "Wedding", "Date night", "Everyday"],
  "minTemp": 15,
  "maxTemp": 25
}
```

- `name` must match `subtypesByGender.json` **exactly** (case, spacing,
  hyphens). This file is not linked to that one automatically.
- `type` decides the role used by outfit shapes and matching.
- `category` is the group shown in the subtype picker
  (`src/components/clothes/uploadComponents/modalOne.jsx`). Use an
  existing category name unless a new group is genuinely wanted.
- `season`, `tags`, `minTemp`, `maxTemp` are the **automatic defaults**
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

## 5. `server/constants/requiresLayering.js` - needs layering (only if applicable)

Only if the subtype can **never be the only item in its role** (e.g. a
cardigan that always needs a top underneath). Add it to the relevant gender
lists. Only affects `top` and `outer` roles.

---

## After the change

1. Run the server tests: `cd server && node --test specs/*.spec.js`.
   The symmetry/self-pair test and the subtype-order check must pass.
2. Restart the server - the matrices are read once on start.
3. Rebuild the frontend (`npx vite build`) if deploying - `dist/` is a
   built copy.
4. Existing users keep their personal score overrides (`matchscores`
   collection) - new pairs fall back to the default matrix automatically.
   Existing matches are not regenerated; new matches appear when a
   clothing item is added or edited.

## Renaming or removing a subtype

Same four files, plus:

- Existing clothes with the old name keep it in the database - they will
  no longer match a matrix row. Update them in the `clothes` collection.
- Personal overrides in `matchscores` store the subtype names
  (`subtypeA` / `subtypeB`) and need updating or deleting too.
