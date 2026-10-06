# Matching overhaul - agreed plan

Decided in discussion on 2026-10-06 and **implemented** the same day.
`context/clothing-and-matching-flow.md` describes the resulting system.
The one-off database update (section 7) has **not been run yet**.

Decisions made during implementation:

- **Matrix format:** since 0 is a valid score, each gender's matrix uses
  `null` for "never matched" and a number for the score. The per-pair
  yes/no grids (Appendix A) are encoded as `null` vs a score.
- **Men's Waistcoat + Romper / Overalls** had no answer in the grids, so
  both default to **no**. Change them in `server/constants/matrices/man.js`
  if wanted.
- **Baseline scores** were written from a classic-styling model (matching
  formality and warmth, balancing proportions, avoiding double
  denim/leather) plus about 300 hand-set classic pairings.

In short:

- **Style archetypes are removed.** There is one set of matching data per
  gender: man, woman, unisex.
- **Matching is split into two independent features:**
  - **Compatibility** is a fixed yes/no. User behaviour can never change it.
  - **Score** is a 0-100 number per pair that user behaviour adjusts. It is
    used to rank outfits, never to decide whether they are allowed.
- **Every match gets a stored `score`** (whole number), set once when the
  match is created.
- **The Today page sorts mainly by score.**

---

## 1. Compatibility (fixed yes/no)

### 1.1 The check, in order

```
isCompatible(a, b):
  1. same subtype                              -> no
  2. bottom+bottom, onepiece+onepiece,
     bottom+onepiece                           -> no
  3. top+bottom, top+outer, bottom+outer,
     onepiece+outer                            -> yes
  4. top+top, outer+outer, top+onepiece        -> per-pair data (Appendix A)
```

- Rules 1-3 live in code, not in data, so a data mistake can't break them.
- Compatibility reads **only** the fixed data. Personal data is never
  consulted, so a pair can never be "unlocked" or "blocked" by behaviour.
- User-built outfits are still never checked for compatibility.

### 1.2 Fixed single-item rules

| Rule | man | woman | unisex |
|---|---|---|---|
| Tops that require another top (only in 2-top shapes) | Warm cardigan, Waistcoat | Warm cardigan | Warm cardigan |
| **New:** onepieces that require a top (only in shapes 10/11) | Overalls | Overalls | Overalls |

"Onepieces that require a top" is a new list, separate from
`requiresLayering.js`'s current meaning ("needs a second item of the same
role", which can never apply to a onepiece).

### 1.3 Subtype changes

- **Men's Waistcoat becomes a `top`** (it was `outer`). It stays a top for
  woman/unisex and only men's requires another top.
- **Renames, everywhere:**

  | Old | New |
  |---|---|
  | Demin jacket | Denim jacket |
  | Short Turtlneck | Short turtleneck |
  | Long-tshirt | Long t-shirt |

  Files: `shared/subtypesByGender.json`, `src/constants/typeOptions.jsx`,
  `SUBTYPE_SYNONYMS` in `uploadHelpers.jsx` (the `"demin jacket"` workaround
  entry is removed), plus the new data files.

---

## 2. Scores

### 2.1 Pair scores

- **Every compatible pair** has a baseline score, a whole number from 0 to
  100. This includes the rule-based "always yes" pairs (top+bottom etc.),
  not just the per-pair ones.
- **0 is a valid score, not "no match".** Compatibility never comes from
  the score.

**Data format (one file per gender, like the current matrices):** an N×N
grid in the canonical subtype order. Each cell is either a score (0-100) or
`null` for "not compatible". The `null` cells encode the per-pair decisions
from Appendix A. On server start, the loader refuses to start if any of
these is true:

- the subtype order doesn't match `shared/subtypesByGender.json`;
- the grid isn't symmetric;
- a pair forbidden by rules 1-2 has a score, or a pair forced by rule 3 is
  `null`;
- a score is not a whole number from 0 to 100.

I'll generate these files as **templates**, pre-filled with `null` from the
agreed yes/no decisions and an empty slot for each compatible pair, for
you to fill in. **The old matrix values are discarded.**

### 2.2 Learning (personal adjustments)

| Event | Change to every pair in the outfit |
|---|---|
| User builds an outfit | **+5** |
| User claims an existing automatic outfit by rebuilding it (2.4) | **+5** |
| User favourites an outfit | **+3** |
| User unfavourites an outfit | **−3** |
| User deletes an outfit (automatic or user-built) | **−2** |
| Deleting a clothing item (its outfits are deleted with it) | none |
| Automatic matching creating an outfit | none |

- Personal data (`MatchScore`) stores the **adjustment**, not the score:
  pair score = baseline + adjustment.
- **The adjustment is limited when it's saved**, so baseline + adjustment
  always stays between 0 and 100. This avoids a hidden reserve building up
  beyond 100 or below 0. When read, the total is limited to 0-100 again, in
  case a baseline is edited later.
- **Pairs that aren't compatible get no record.** For example, a
  user-built outfit with two bottoms adjusts its other pairs but never the
  bottom+bottom pair.
- **All personal adjustments are wiped only on a gender change.** There is
  no style any more.
- Existing `MatchScore` documents hold old absolute scores and are wiped.
  The field becomes an adjustment.

### 2.3 The match `score` field

New `score: Number` on the `Match` schema. It is required and a whole
number, and every match has one.

| Match | Score |
|---|---|
| Automatic, 2+ items | **70% × average pair score + 30% × lowest pair score**, rounded |
| Automatic, single item (onepiece alone) | **80** |
| User-built | **90** (flat) |
| Claimed automatic outfit (2.4) | changes to **90** |

- Pair scores are read **at creation time**, including the user's
  adjustments.
- **The score is set once and never recalculated.** The only exception is
  claiming (2.4).
- **A favourite shows and sorts as 100.** The stored score is not
  overwritten, so unfavouriting returns the outfit to its original score.
  The effective score is `favourite ? 100 : score`.
- No backfill is needed, because there are no matches in the database.

### 2.4 Rebuilding an existing automatic outfit

Today this returns 409 "Match already exists" and no learning happens.
Instead, rebuilding an automatic outfit **claims** it:

- it is marked `userMade: true`;
- its score becomes 90;
- +5 is applied to its pairs.

Rebuilding an outfit that is already user-made still returns 409.

### 2.5 Favourite toggling

Favourites are saved through the generic `PUT /match/:id`
(`updateMatch`). The ±3 is applied there, only when `favourite` actually
changes from false to true or true to false.

---

## 3. Automatic matching changes (`processMatches`)

- **The search itself is unchanged:** shapes, backtracking, pruning,
  colour/pattern/season/temperature checks. Only the pair check changes,
  to `isCompatible` (section 1).
- **Every finished candidate is scored** (2.3).
- **Only the best 100 per new item are saved:** after removing outfits
  that already exist, keep the 100 highest scores.
- **Limits:** `MAX_COMBINATIONS_EXPLORED` goes up from 20,000 to
  **200,000**. A new **3-second time limit** is added. When either limit
  is hit, the search stops and the best 100 found so far are kept. These
  limits were originally added to stay inside the serverless execution
  limit (commit `e278799`).
- `MAX_POOL_SIZE_PER_ROLE` (60) is unchanged.
- The stale comment saying every baseline is "a placeholder 5" is removed.

---

## 4. Today page sorting (`todayOutfitSort.jsx`)

```js
const SCORE_WEIGHTS = {
  temperature: 0.10,
  clothingFreshness: 0.30,
  outfitFreshness: 0.20,
  score: 0.40
};
```

- The new `score` factor is `(favourite ? 100 : match.score) / 10`, so it is
  on the same 0-10 scale as the other factors.
- The `userMade` and `favourite` factors are removed. The flat 90 and the
  favourite 100 replace them.
- Outfits with today's tag still come first, unchanged.

---

## 5. Score display (temporary, for testing)

- Small grey "Score 72" text on the match cards (`viewMatchesCard.jsx`)
  and the Today cards.
- Favourites show 100.
- It is one clearly marked component and style, so it is easy to delete
  later.

---

## 6. Removing style completely

- **Quiz:** remove `style` from `styleImageOptions`, plus
  `stylePriority` and the style vote in `resolveStyleQuiz.js`. The image
  step **stays**, because it still decides colour and pattern.
- **Quiz gate** (`App.jsx` `checkNeedsStyleQuiz`): no longer requires
  `style`.
- **Preferences page** (`stylePreferences.jsx`): stop sending `style`.
- **Server:**
  - remove `style` from the `Preferences` schema;
  - in `getUserMatchingPreferences`, remove `DEFAULT_STYLE` and the man
    → `all` rule;
  - `updatePreferences` wipes personal adjustments on a gender change only.
- **Matrices:** `matchScoreBaseline.js` loads 3 files (one per gender). The
  7 old archetype files and the `context/LWS Matrix - *.csv` files they
  came from are deleted.

---

## 7. One-off database update script

Run once, after the code changes are deployed:

1. Rename `subtype` on existing clothes: Demin jacket → Denim jacket,
   Short Turtlneck → Short turtleneck, Long-tshirt → Long t-shirt.
2. For men's users, change `type` from `outer` to `top` on Waistcoat items.
3. Remove `style` from every `Preferences` document.
4. Delete every `MatchScore` document.

There are no matches, so nothing else needs migrating.

---

## 8. Tests and docs

- Update the specs in `server/specs/`:
  - `matrixService`: compatibility rules and validation;
  - `matchScoreService`: adjustments, limits, ±5/−2/±3;
  - `matchService`: best-N selection and the limits;
  - `matchScoreBaseline`: loading and validating the new files;
  - `outfitEvaluator`: the score calculation.
- Update `context/clothing-and-matching-flow.md` and
  `context/adding-a-subtype.md` to match.

## 9. Not in scope (known issues left as they are)

From Part 8 of the flow doc:

- tag objects in item names break saving;
- duplicate items return 200;
- the `pattern` preference is unused;
- `Coral`/`Kharki` are in palettes but can't be picked;
- `updateItem` has no `.catch` on `processMatches`;
- outer-only user outfits get `max_temp: Infinity`.

## 10. Order of work

1. Generate the score templates. **You fill in the scores.** The code
   work below can start in parallel, using placeholder values.
2. Renames and men's Waistcoat → top (subtype lists, typeOptions,
   synonyms).
3. Remove style (quiz, gate, preferences page, schema, server).
4. Compatibility: rules, new data loader and validation, the
   onepiece-requires-top list.
5. Scores: schema field, adjustment storage and limits, learning events,
   score calculation, claiming, favourite ±3.
6. `processMatches`: scoring, best 100, new limits.
7. Today sort weights, and the temporary score display.
8. Tests, then the database update script, then the docs.

---

## Appendix A - Agreed per-pair compatibility

Anything not listed is not compatible. Rule-based pairs (section 1.1) are
not repeated here.

### Woman

#### outer + outer

| Subtype | Compatible with |
|---|---|
| Blazer | Trench coat, Fur coat, Winter Coat |
| Poncho | Duffle coat, Rain coat, Winter Coat |
| Duffle coat | Poncho, Jacket, Denim jacket, Fleece |
| Rain coat | Poncho, Jacket, Denim jacket, Fleece |
| Trench coat | Blazer, Fleece |
| Fur coat | Blazer, Fleece |
| Puffer coat | Fleece |
| Winter Coat | Blazer, Poncho, Fleece |
| Jacket | Duffle coat, Rain coat, Fleece |
| Denim jacket | Duffle coat, Rain coat, Fleece |
| Fleece | Duffle coat, Rain coat, Trench coat, Fur coat, Puffer coat, Winter Coat, Jacket, Denim jacket |
| Leather jacket | — |

#### top + top

| Subtype | Compatible with |
|---|---|
| Hoodie/sweatshirt | Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt, Vest |
| Warm jumper | Buttondown shirt, Linen shirt, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Turtleneck jumper | Light cardigan, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Warm cardigan | Buttondown shirt, Linen shirt, Floaty blouse, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Light jumper | Light cardigan, Buttondown shirt, Linen shirt, Floaty blouse, Fancy blouse, Fancy top, Waistcoat, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest, Tunic |
| Light cardigan | Turtleneck jumper, Light jumper, Buttondown shirt, Linen shirt, Floaty blouse, Fancy blouse, Fancy top, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest, Croptop, Tunic |
| Buttondown shirt | Warm jumper, Warm cardigan, Light jumper, Light cardigan, Waistcoat, Short turtleneck, Long turtleneck, Bodysuit, Vest, Croptop |
| Linen shirt | Warm jumper, Warm cardigan, Light jumper, Light cardigan, Waistcoat, Vest, Croptop |
| Floaty blouse | Warm cardigan, Light jumper, Light cardigan, Waistcoat |
| Fancy blouse | Light jumper, Light cardigan, Waistcoat |
| Fancy top | Light jumper, Light cardigan, Waistcoat |
| Waistcoat | Light jumper, Buttondown shirt, Linen shirt, Floaty blouse, Fancy blouse, Fancy top, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Short turtleneck | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Waistcoat |
| Long turtleneck | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Waistcoat |
| Bodysuit | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Waistcoat |
| Short t-shirt | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Waistcoat |
| Long t-shirt | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Waistcoat |
| Vest | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat |
| Croptop | Light cardigan, Buttondown shirt, Linen shirt |
| Off-the-shoulder top | — |
| Tunic | Light jumper, Light cardigan |

#### top + onepiece (listed per onepiece)

| Subtype | Compatible with |
|---|---|
| Jumpsuit | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt |
| Playsuit | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Short t-shirt, Long t-shirt |
| Overalls | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt, Vest, Croptop |
| Summer dress | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt |
| Wedding guest dress | Light jumper, Light cardigan |
| Evening dress | Light jumper, Light cardigan |
| Cocktail dress | Light jumper, Light cardigan |
| Winter dress | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Short turtleneck, Long turtleneck |
| Casual dress | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt |
| Work dress | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat, Short turtleneck, Long turtleneck |

### Man

#### outer + outer

| Subtype | Compatible with |
|---|---|
| Blazer | Trench coat, Winter Coat |
| Duffle coat | Jacket, Denim jacket, Shacket, Fleece |
| Rain coat | Jacket, Denim jacket, Shacket, Fleece |
| Trench coat | Blazer, Shacket, Fleece |
| Puffer coat | Shacket, Fleece |
| Winter Coat | Blazer, Shacket, Fleece |
| Jacket | Duffle coat, Rain coat, Shacket, Fleece |
| Denim jacket | Duffle coat, Rain coat, Shacket, Fleece |
| Shacket | Duffle coat, Rain coat, Trench coat, Puffer coat, Winter Coat, Jacket, Denim jacket, Leather jacket |
| Fleece | Duffle coat, Rain coat, Trench coat, Puffer coat, Winter Coat, Jacket, Denim jacket |
| Leather jacket | Shacket |

#### top + top

| Subtype | Compatible with |
|---|---|
| Hoodie/sweatshirt | Turtleneck, Short t-shirt, Long t-shirt, Vest |
| Warm jumper | Buttondown shirt, Linen shirt, Turtleneck, Short t-shirt, Long t-shirt, Vest |
| Warm cardigan | Buttondown shirt, Linen shirt, Turtleneck, Short t-shirt, Long t-shirt, Vest |
| Light jumper | Buttondown shirt, Linen shirt, Turtleneck, Short t-shirt, Long t-shirt, Vest |
| Buttondown shirt | Warm jumper, Warm cardigan, Light jumper, Turtleneck, Short t-shirt, Long t-shirt, Vest, Waistcoat |
| Linen shirt | Warm jumper, Warm cardigan, Light jumper, Turtleneck, Short t-shirt, Long t-shirt, Vest, Waistcoat |
| Turtleneck | Hoodie/sweatshirt, Warm jumper, Warm cardigan, Light jumper, Buttondown shirt, Linen shirt, Waistcoat |
| Short t-shirt | Hoodie/sweatshirt, Warm jumper, Warm cardigan, Light jumper, Buttondown shirt, Linen shirt, Waistcoat |
| Long t-shirt | Hoodie/sweatshirt, Warm jumper, Warm cardigan, Light jumper, Buttondown shirt, Linen shirt, Waistcoat |
| Vest | Hoodie/sweatshirt, Warm jumper, Warm cardigan, Light jumper, Buttondown shirt, Linen shirt |
| Waistcoat | Buttondown shirt, Linen shirt, Turtleneck, Short t-shirt, Long t-shirt |

#### top + onepiece (listed per onepiece)

| Subtype | Compatible with |
|---|---|
| Romper | — |
| Overalls | Linen shirt, Turtleneck, Short t-shirt, Long t-shirt, Vest |

### Unisex

#### outer + outer

| Subtype | Compatible with |
|---|---|
| Blazer | Trench coat, Fur coat, Winter Coat |
| Poncho | Duffle coat, Rain coat, Winter Coat |
| Duffle coat | Poncho, Jacket, Denim jacket, Shacket, Fleece |
| Rain coat | Poncho, Jacket, Denim jacket, Shacket, Fleece |
| Trench coat | Blazer, Shacket, Fleece |
| Fur coat | Blazer, Fleece |
| Puffer coat | Shacket, Fleece |
| Winter Coat | Blazer, Poncho, Shacket, Fleece |
| Jacket | Duffle coat, Rain coat, Shacket, Fleece |
| Denim jacket | Duffle coat, Rain coat, Shacket, Fleece |
| Shacket | Duffle coat, Rain coat, Trench coat, Puffer coat, Winter Coat, Jacket, Denim jacket, Leather jacket |
| Fleece | Duffle coat, Rain coat, Trench coat, Fur coat, Puffer coat, Winter Coat, Jacket, Denim jacket |
| Leather jacket | Shacket |

#### top + top

| Subtype | Compatible with |
|---|---|
| Hoodie/sweatshirt | Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt, Vest |
| Warm jumper | Buttondown shirt, Linen shirt, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Turtleneck jumper | Light cardigan, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Warm cardigan | Buttondown shirt, Linen shirt, Floaty blouse, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Light jumper | Light cardigan, Buttondown shirt, Linen shirt, Floaty blouse, Fancy blouse, Fancy top, Waistcoat, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest, Tunic |
| Light cardigan | Turtleneck jumper, Light jumper, Buttondown shirt, Linen shirt, Floaty blouse, Fancy blouse, Fancy top, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest, Croptop, Tunic |
| Buttondown shirt | Warm jumper, Warm cardigan, Light jumper, Light cardigan, Waistcoat, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest, Croptop |
| Linen shirt | Warm jumper, Warm cardigan, Light jumper, Light cardigan, Waistcoat, Short t-shirt, Vest, Croptop |
| Floaty blouse | Warm cardigan, Light jumper, Light cardigan, Waistcoat |
| Fancy blouse | Light jumper, Light cardigan, Waistcoat |
| Fancy top | Light jumper, Light cardigan, Waistcoat |
| Waistcoat | Light jumper, Buttondown shirt, Linen shirt, Floaty blouse, Fancy blouse, Fancy top, Short turtleneck, Long turtleneck, Bodysuit, Short t-shirt, Long t-shirt, Vest |
| Short turtleneck | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Waistcoat |
| Long turtleneck | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Waistcoat |
| Bodysuit | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Waistcoat |
| Short t-shirt | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat |
| Long t-shirt | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Waistcoat |
| Vest | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat |
| Croptop | Light cardigan, Buttondown shirt, Linen shirt |
| Off-the-shoulder top | — |
| Tunic | Light jumper, Light cardigan |

#### top + onepiece (listed per onepiece)

| Subtype | Compatible with |
|---|---|
| Jumpsuit | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt |
| Playsuit | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Short t-shirt, Long t-shirt |
| Romper | — |
| Overalls | Turtleneck jumper, Light cardigan, Buttondown shirt, Linen shirt, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt, Vest, Croptop |
| Summer dress | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt |
| Wedding guest dress | Light jumper, Light cardigan |
| Evening dress | Light jumper, Light cardigan |
| Cocktail dress | Light jumper, Light cardigan |
| Winter dress | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Short turtleneck, Long turtleneck |
| Casual dress | Hoodie/sweatshirt, Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat, Short turtleneck, Long turtleneck, Short t-shirt, Long t-shirt |
| Work dress | Warm jumper, Turtleneck jumper, Warm cardigan, Light jumper, Light cardigan, Buttondown shirt, Linen shirt, Waistcoat, Short turtleneck, Long turtleneck |
