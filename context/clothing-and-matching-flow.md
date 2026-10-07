# Adding clothes and matching outfits

This walks through the whole flow, from a user adding a clothing item to
outfits (matches) being created from it. It covers:

1. How an item is added, and which fields are filled in automatically.
2. How an item is checked ("approved") before it is saved.
3. The user's preferences, and where each one is used.
4. How outfits are matched automatically, check by check, and scored.
5. How outfits the user builds by hand differ.
6. How the app learns from what the user builds, favourites and deletes.
7. How scores are shown and used to sort the Today page.
8. A worked example, known quirks, the reasons behind the design, and the
   one-off database scripts.

Two related docs go deeper on specific parts and aren't repeated here:

- `context/temperature-ranges.md` covers how match temperature ranges are
  worked out. Clothing items have no temperature range.
- `context/adding-a-subtype.md` covers adding, renaming or removing a
  subtype (subtype lists, score matrices, temperature groups).

The reasons behind the current design are in Part 10, and the one-off
database scripts in Part 11.

In short:

- **Page one** of the add form asks for a name, image and subtype. When the
  user clicks **Next**, page two is filled in from the **name** (colours,
  seasons, tags) and the **subtype** (seasons, tags). Items have no
  temperature - only matches do.
- **Style** (`Plain` / `Patterned`) is never chosen by the user. It is
  `Patterned` whenever the item has more than one colour.
- There is **no manual or admin approval**. An item is accepted once it
  passes the form's checks and the server's checks (auth, type, duplicate,
  schema).
- Once an item is saved, the server **searches for every possible outfit**
  that includes it from the rest of the wardrobe, in the background. An
  outfit is a candidate only if it passes all of these: fixed compatibility,
  layering rules, colour palette, pattern limit, a shared season and a
  shared tag.
  Temperature never rejects an outfit - each match gets a preset range from
  its subtypes. Every candidate gets a **score (0-100)** and only the **best
  100** new ones are saved.
- **Compatibility is fixed.** Role rules plus the gender's matrix decide
  whether two items can ever be in the same outfit. User behaviour never
  changes it.
- The **matrix** used depends on the user's gender. The **colour palettes**
  depend on their colour level. Both come from the style quiz.
- User-made outfits are **never rejected** and always score 90. Building
  one (+5), favouriting (+3) or deleting any outfit (−2) adjusts the user's
  personal score for every compatible subtype pair in it. That changes
  how future automatic outfits are **scored and ranked**, never whether
  they are allowed.

---

## Part 1 - Adding a clothing item

Files:

| File | Role |
|---|---|
| `src/components/clothes/addUpdateClothes.jsx` | The two-page modal, validation and saving |
| `src/components/clothes/uploadComponents/modalOne.jsx` | Page one: name, image, subtype |
| `src/components/clothes/uploadComponents/modalTwo.jsx` | Page two: seasons, colours, tags |
| `src/components/clothes/uploadComponents/useClothingForm.jsx` | Form state and toggle handlers |
| `src/components/clothes/uploadComponents/useClothingDetection.jsx` | Auto-fills page two when Next is clicked |
| `src/components/clothes/uploadComponents/uploadHelpers.jsx` | Name detection, subtype suggestions, defaults |
| `src/constants/typeOptions.jsx` | Subtypes per gender, with their category and default seasons/tags |
| `src/constants/optionsBank.jsx` | Colour, tag and season option lists |

### 1.1 When the form opens

`addUpdateClothes` fetches `/preferences` once and reads:

- `gender` decides which subtype list is shown
  (`getTypeOptions(gender)`). It is `unisex` until it loads, and stays
  `unisex` if the user has no preferences or an unknown gender.

The form starts from `getInitialState()` (`uploadHelpers.jsx`): empty name,
no colours, `styles: "plain"`, and no seasons or tags.

### 1.2 Page one: name, image, subtype

**Name.** Free text and required. It drives the subtype suggestions and,
later, colour/season/tag detection.

**Image.** `UploadImages` keeps the chosen `File` in `selectedImage`. Nothing
is uploaded yet. Uploading happens only when the user clicks Save (1.5).

**Subtype ("Type").** Picked in one of two ways:

1. **Suggestions.** `suggestSubtypesFromName(name, typeOptions)` shows up
   to 4 subtypes whose keywords match the name. A subtype's keywords are:
   - its full name, lowercased;
   - the name with `/` and `-` replaced by spaces;
   - the name with `/`, `-` and spaces removed;
   - each separate word of the name;
   - any extra words in `SUBTYPE_SYNONYMS` (for example `"tee"` for
     Short t-shirt, `"parka"` for Winter coat).

   Keywords of 2 characters or fewer, and stopwords (`and`, `the`, `or`,
   `a`, `an`, `of`), are dropped. A subtype matches if the typed name
   contains a keyword, or a keyword contains the typed name. Suggestions
   appear in `typeOptions` order, not ranked by how well they match.
2. **Category browser.** The user picks a category (`category` in
   `typeOptions`), then a subtype within it.

`handleSubtypeChange` sets **two** fields:

- `subtype`, the exact name (for example `"Buttondown shirt"`).
- `type`, the subtype's **role**: `top`, `bottom`, `onepiece` or `outer`.
  Outfit shapes and matching all use the role.

Nothing on page two is filled in yet.

**Validation for page one:** name, subtype and an image (a new file or an
existing `imageUrl`) are all required. Clicking Next with any missing
shows "Please enter a name, a type and an image."

### 1.3 Clicking Next: automatic fields

`handleNext` → `applyDetection(name, subtype)` in `useClothingDetection.jsx`.

**It only runs for a new item.** When editing, it returns immediately and
nothing is auto-filled (see 1.8).

**It only runs when the name or subtype has changed** since the last time
page two was filled. Going Back and then Next again without changing
anything leaves page two exactly as the user left it.
(`resetDetection()` clears this memory when "Add Another Item" is clicked.)

Seasons and tags are cleared first, then rebuilt from the sources below.

| Field | Comes from | Rule |
|---|---|---|
| `colors` | Name only | Every colour in `colorOptions` whose name appears anywhere in the lowercased item name. **Only replaced if the name changed.** If only the subtype changed, the user's colour picks are kept. |
| `styles` | Colours | `Patterned` if there are 2 or more colours, otherwise `Plain`. Recalculated every time the colours change (1.4). |
| `spring`/`summer`/`autumn`/`winter` | Name **plus** subtype | Set to true if the name contains `spring`, `summer`, `autumn`/`fall` or `winter`, **or** the subtype's default `season` list includes it. The result is the union of both. |
| `tags` | Name **plus** subtype | Tags whose name appears in the item name, plus the subtype's default `tags`, de-duplicated. |
| `type` | Subtype | Already set on page one. |

#### Colour detection details

Detection is a plain substring check (`lower.includes(color.name.toLowerCase())`),
so:

- `"Forest green jumper"` detects **both** `Forest Green` and `Green`, so it
  has 2 colours and becomes **Patterned**. The same happens for
  `Lime Green` / `Olive Green` + `Green`.
- A colour name inside another word is detected too. For example
  `"Tank top"` → `Tan`, `"Embroidered blouse"` → `Red`, `"Golden …"` →
  `Gold`.
- Some other words count as a colour (`COLOR_NAME_ALIASES`): `"beige"` →
  `Cream`, `"lavender"` → `Lilac`. Beige and Lavender were merged into
  those colours and can't be picked any more.
- There is no plain "Blue". Only `Dark Blue`, `Light Blue`, `Navy`,
  `Teal` and `Turquoise` exist, so `"Blue jeans"` detects no colour. The
  user has to pick one, because page two needs at least one colour.

The user can correct all of this on page two.

### 1.4 Page two: the user reviews

`modalTwo.jsx` shows everything filled in above, and the user can change any
of it:

- **Seasons.** Checkboxes (`toggleSeason`).
- **Colours.** A grid of the 28 `colorOptions` (`toggleColor`).
- **Tags.** The 10 `tagOptions`: Work, Gym, Loungewear, Party, Date night,
  Wedding, Beach, Outdoor, Dinner, Everyday.

There is no temperature on the form - items don't have one.

**Style is recalculated automatically.** An effect in `addUpdateClothes.jsx`
sets `styles` to `"Patterned"` when there are more than one colour and to
`"Plain"` otherwise, every time the colours change. (`toggleColor` also sets
a lowercase `"patterned"`, but the effect overwrites it straight away, so
the value saved is always `"Plain"` or `"Patterned"`.) There is no control
for style on the form.

**Validation for page two:** at least one season and at least one colour. Tags are optional.

### 1.5 Saving

`handleSubmit` in `addUpdateClothes.jsx`:

1. **Image upload.** If a new image was chosen, it is uploaded straight
   from the browser to Cloudinary (`VITE_CLOUD_NAME`, unsigned preset
   `VITE_UPLOAD_PRESET`). This uses `fetch` so the app's auth header isn't
   sent to Cloudinary. The result supplies `imageUrl` (`secure_url`) and
   `cloudinaryId` (`public_id`).
2. **Payload.** The whole `formData` plus the new image fields. Any
   `min_temp`/`max_temp` left on an item saved before temperatures moved to
   matches is dropped.
3. **Request.**
   - New item: `POST /clothing` (plus `username`, which the schema ignores).
   - Edit: `PUT /clothing/:id`.
4. **Old image cleanup (edits only).** If the image was replaced, the old
   one is deleted via `POST /cloudinary/delete`.
5. **On failure.** If the save fails after the image was uploaded, the new
   image is deleted again so Cloudinary doesn't keep orphans.
6. **On success.** The modal shows "Item created"/"Item updated" and two
   buttons: **View New Matches** and (new items only) **Add Another Item**.

### 1.6 How an item is approved

There is no moderation or admin approval step. An item is accepted once it
gets through these checks, in order:

| # | Where | Check | On failure |
|---|---|---|---|
| 1 | Page one (client) | Name, subtype, image present | Message, can't continue |
| 2 | Page two (client) | ≥1 season, ≥1 colour | Message, can't save |
| 3 | `authMiddleware` | Valid `Bearer` JWT; sets `req.user.userId` | 401 |
| 4 | `createItem` | `type` present | 400 "Missing type" |
| 5 | `createItem` | No existing item with the same `name` + `type` for this user | Returns the existing item (see Part 9) |
| 6 | Mongoose `Clothes` schema | `name`, `userId`, `colors`, `styles`, `type`, `subtype`, all four seasons are required. Fields must cast (for example `tags` must be strings) | 500 with the validation message |

On edit (`updateItem`), checks 3 and 6 run (`runValidators: true`). There is
no duplicate check on edit.

The server **does not** check that `subtype` exists in the user's gender
list, or that `type` matches the subtype. It trusts the client. An item
whose subtype isn't in the user's matrix is saved, but it can never be
matched automatically (3.3).

Subtype names have changed over time (e.g. Demin jacket → Denim jacket,
Wideleg trousers → Wide leg trousers, men's Waistcoat is now a `top`,
Chinos is no longer a women's subtype). Items saved under an old name stop
being matched until they're updated - see the scripts in Part 11.

### 1.7 After saving: automatic matching starts

`createItem` saves the item, loads the user's whole wardrobe, and calls
`processMatches(item, allItems)` **without awaiting it**, passing the
promise to Vercel's `waitUntil` (`matchInBackground` in
`allControllers.js`) so the function stays alive until matching finishes,
up to the 300s `maxDuration` in `vercel.json`. It then responds right away
with the item plus `processing: true`. `updateItem` does the same after an
edit.

Clicking **View New Matches** opens `/matches?item=<id>` with
`state.processing = true`. `src/pages/Matches.jsx` then re-fetches
`/match/` every second, up to 8 times, until a match containing that item
appears. Then it shows the matches, filtered to that item.

### 1.8 Editing an existing item

- The form starts from the saved item.
- **Nothing is auto-filled.** `applyDetection` returns straight away, so
  renaming an item doesn't re-detect colours, and changing its subtype
  doesn't reset seasons or tags. A subtype change still
  updates `type`.
- Style is still recalculated from the colours (1.4).
- After the save, `processMatches` runs again for the item. It only **adds**
  outfits that don't exist yet. Existing outfits containing the item are
  **not** re-checked, re-scored or removed, even if the edit means they
  would no longer pass.

---

## Part 2 - The user's preferences

Files: `src/components/styleQuiz/StyleQuizForm.jsx`,
`src/constants/styleQuizOptions.js`, `src/utils/resolveStyleQuiz.js`,
`src/components/preferences/stylePreferences.jsx`,
`server/models/AllModels.js` (`Preferences`),
`updatePreferences` in `server/controllers/allControllers.js`.

### 2.1 The style quiz

After logging in, `App.jsx` (`checkNeedsStyleQuiz`) fetches `/preferences`.
If any of `gender`, `colour`, `pattern` or `temperature` is missing, or no
preferences exist yet (404), `StyleQuizGate` redirects every gated page to
`/style-quiz`.

The quiz has four steps:

1. **"How do you usually dress?"**: More feminine → `woman`, More unisex →
   `unisex`, More masculine → `man`. Saved as `gender`.
2. **"Select all that apply"**: a grid of style images. Only images whose
   `gender` list includes the chosen gender are shown. At least one image
   must be picked.
3. **"What do you generally wear throughout the week?"**
   (`WeeklyTagStep.jsx`): a tag for each day, picked from the tag images.
   Picking a tag moves on to the next day. Every day is optional, and only
   the days picked are saved, so retaking the quiz never clears a day set
   on the Weekly Preferences page. Saved as `monday` … `sunday`.
4. **"Do you generally feel too cold or too hot?"**: `cold` / `hot` /
   `normal`. Choosing one saves the whole quiz.

### 2.2 How the images become colour and pattern

Each image in `styleImageOptions` carries two labels:

| Image | colour | pattern | Shown for |
|---|---|---|---|
| fun1 | max | max | woman |
| fun2 | mid | max | unisex |
| fun3 | max | mid | woman, man |
| classic1 | min | min | unisex |
| classic2 | min | mid | woman |
| classic3 | mid | min | man |
| fashion1 | mid | mid | woman, unisex |
| fashion2 | max | min | man |
| fashion3 | min | max | woman |

(The image keys are just file names - there are no style archetypes any
more. The comments in `styleQuizOptions.js` note that the gender
assignments are placeholders.)

`resolveStyleQuiz(selectedKeys)` takes a **majority vote** across the
selected images, separately for each label:

- **colour.** The most common `colour`. Ties go to the first in
  `levelPriority = ["min", "mid", "max"]`, so ties lean towards fewer
  colours.
- **pattern.** Same as colour.

Example: a woman picks fun1, classic2 and fashion3.

- colour: max 1, min 2 → **min**
- pattern: max 2, mid 1 → **max**

`PUT /preferences` is sent with `{ gender, colour, pattern, temperature }`.

### 2.3 Changing preferences later

`stylePreferences.jsx` (on the user page) lets the user change gender and
temperature, and optionally re-pick images. Colour and pattern are only
re-calculated and sent **if at least one image is selected**. Otherwise
they stay as they were. Unlike the quiz, this page shows all 9 images
regardless of gender.

In `updatePreferences`, if the **gender actually changes**, all of the
user's personal score adjustments are deleted (`wipeUserScores`). Scoring
falls back to the new gender's matrix. Changing colour, pattern,
temperature or the weekday tags never wipes them.

Changing preferences doesn't touch existing clothes or matches. It only
affects items added and outfits matched afterwards.

### 2.4 What each preference does

| Preference | Values | Used for | Where |
|---|---|---|---|
| `gender` | man / woman / unisex | Which subtype list the add form shows. Which matrix is used. Which layering lists are used. | `typeOptions.jsx`, `getBaselineMatrix`, `getLayeringRules` |
| `colour` | min / mid / max | Which colour palette list is used, and the colour-count cap | `getColorRules` |
| `pattern` | min / mid / max | **Saved and required by the quiz gate, but not used by matching.** The pattern rule is the same for everyone (3.7). | - |
| `temperature` | cold / normal / hot | Shifts every new match's temperature range ±2° | `temperature-ranges.md` |
| `monday` … `sunday` | a tag name | That day's tag is used to put matching outfits first on the Today page | `todayOutfitSort.jsx` |

### 2.5 Defaults when something is missing

`getUserMatchingPreferences` (`server/services/matchScoreService.js`) is
the single place the server reads these:

- gender missing → `unisex`
- colour missing → `mid` palettes (`DEFAULT_COLOUR_LEVEL`)
- temperature missing → treated as `normal`

`getBaselineMatrix(gender)` falls back to the **unisex** matrix for an
unknown gender.

---

## Part 3 - The building blocks of matching

Matching has two separate parts:

- **Compatibility** (3.1-3.5): can these items ever be in the same
  automatic outfit? Fixed - never changed by user behaviour.
- **Score** (3.6, Part 6): how good is the outfit? Starts from the matrix
  and learns from the user.

### 3.1 Role rules

`server/constants/compatibilityRules.js`. Every pair of items is first
checked by role:

| Role pair | Rule |
|---|---|
| bottom + bottom, onepiece + onepiece, bottom + onepiece | **never** |
| top + bottom, top + outer, bottom + outer, onepiece + outer | **always** |
| top + top, outer + outer, top + onepiece | **decided per pair** by the matrix |

On top of that, **the same subtype twice never matches** (two puffer
coats, two short t-shirts).

### 3.2 The three matrices

`server/constants/matchScoreBaseline.js` loads one matrix per gender from
`server/constants/matrices/`:

| Gender | File | Subtypes |
|---|---|---|
| woman | `woman.js` | 68 |
| unisex | `unisex.js` | 72 |
| man | `man.js` | 36 |

Each matrix is a symmetric grid. `scores[i][j]` is either:

- a **score from 0 to 100**: the pair is compatible, and this is its
  baseline score; or
- **`null`**: the pair can never be matched.

`0` is a valid (poor) score, not "never". The subtype order must match
`shared/subtypesByGender.json`, which lists each gender's subtypes by role
(tops, bottoms, onepieces, outers).

**On server start** every matrix is checked, and the server refuses to
start if:

- the subtype order is wrong;
- the grid isn't symmetric;
- a subtype paired with itself isn't `null`;
- a "never" role pair has a score;
- an "always" role pair is `null`;
- a score isn't a whole number from 0 to 100.

So for the "always" pairs the matrix only says *how good* the match is.
For the "decided" pairs (top+top, outer+outer, top+onepiece), `null` is
where "these can't be worn together" is recorded.

The baseline scores were written from a classic-styling point of view
(matching formality and warmth, balancing a loose piece with a fitted one,
avoiding double denim/leather), with hand-set scores for classic pairings
like Buttondown shirt + Tailored trousers (96) or Leather jacket + Skinny
jeans (94). They're meant to be hand-edited.

### 3.3 Compatibility check

`isCompatible` (`server/services/matrixService.js`), in order:

1. same subtype → no
2. role pair is "never" → no
3. the matrix has a score (not `null`) → yes

It reads **only** the baseline matrix - never personal adjustments - so
nothing the user does can make a pair match or stop matching. A subtype
not in the user's gender matrix is never compatible.

### 3.4 Outfit shapes

`server/constants/outfitShapes.js` lists the only structures an automatic
outfit can have:

| Shape | top | bottom | onepiece | outer |
|---|---|---|---|---|
| 1 | 0 | 0 | 1 | 0 |
| 2 | 0 | 0 | 1 | 1 |
| 3 | 0 | 0 | 1 | 2 |
| 4 | 1 | 1 | 0 | 0 |
| 5 | 1 | 1 | 0 | 1 |
| 6 | 2 | 1 | 0 | 0 |
| 7 | 2 | 1 | 0 | 1 |
| 8 | 1 | 1 | 0 | 2 |
| 9 | 2 | 1 | 0 | 2 |
| 10 | 1 | 0 | 1 | 0 |
| 11 | 1 | 0 | 1 | 1 |

Tops and outers can appear twice, so they are the **layerable roles**.
Bottoms and onepieces appear at most once.

### 3.5 Single-item rules

`server/constants/requiresLayering.js`. Fixed rules that personal scores
can't change:

| Rule | man | woman | unisex |
|---|---|---|---|
| `REQUIRES_LAYERING`: a top that can never be the only top (only in 2-top shapes) | Warm cardigan, Waistcoat | Warm cardigan | Warm cardigan |
| `REQUIRES_TOP`: a onepiece that must be worn with a top (only in shapes 10/11) | Overalls | Overalls | Overalls |

### 3.6 Colour rules

`server/utils/colorPalettes.js` holds a separate palette list for each
colour level:

| Level | Palettes | Palette size | Max distinct colours in an outfit |
|---|---|---|---|
| min | 30 | 3–4 | 4 |
| mid | 41 | 4–5 | 7 |
| max | 52 | 5–8 | no cap |

An outfit passes if **all of its colours together fit inside at least one
palette**, and the number of distinct colours is within the cap.

Colours don't need to be close to each other. They just need to appear
together in some palette. For example, Black + Navy is never allowed at
`min`, but is allowed at `mid` and `max`. Black + Camel isn't allowed at any
level.

### 3.7 The pattern rule

`passesPatternCheck`: **at most one patterned item per outfit.** "Patterned"
means the item has 2 or more colours (1.4). This is the same for every user.
The `pattern` preference doesn't change it.

### 3.8 Season and tag rules

All items must share **at least one** season (`hasSharedSeason`). The saved
outfit is marked for exactly the seasons every item has (`computeSeasons`).

All items must also share **at least one** tag (`hasSharedTag` in
`server/services/helpers.js`). An item with no tags shares nothing, so it
never matches automatically. The saved outfit gets exactly the tags every
item has (`computeMatchTags`). For example, `Work, Everyday` + `Everyday`
matches with tags `Everyday`, while `Work` + `Party` doesn't match.

### 3.9 Temperature rule

`computePresetTemperatureRange` (`server/services/presetTemperatureService.js`)
works out every match's range from its **subtypes** - clothing items have no
range of their own. Temperature **never rejects** an outfit. Full details in
`temperature-ranges.md`.

### 3.10 Outfit scores

`server/services/outfitScoreService.js`, numbers in
`server/constants/scoring.js`. Every match has a whole-number `score` from
0 to 100, **set when the match is created** (and afterwards only changed by
claiming it, 5.3, or rejecting it on the Today page, 7.2):

| Match | Score |
|---|---|
| Automatic, 2+ items | **70% × average pair score + 30% × lowest pair score**, rounded |
| Automatic, single item (a onepiece alone) | **80** |
| User-built, or a claimed automatic match (5.3) | **90** |

A **pair score** is the matrix baseline plus the user's personal
adjustment (Part 6), kept between 0 and 100. The blend means one clashing
pair pulls the whole outfit down: pairs of 80, 80, 80, 80, 80 and 5 give
0.7 × 67.5 + 0.3 × 5 = **49**.

A **favourite is shown and sorted as 100**, without changing the stored
score - unfavouriting returns the match to its original score.

---

## Part 4 - Automatic matching (`processMatches`)

File: `server/services/matchService.js`, with `outfitEvaluator.js`,
`matrixService.js`, `outfitScoreService.js`, `styleColorService.js`,
`presetTemperatureService.js`.

### 4.1 Overview

```
item saved
  │
  ▼
processMatches(newItem, wardrobe)            (not awaited; kept alive by waitUntil)
  │  load preferences + personal adjustments + existing match keys
  │  → context: matrix (gender), layering rules (gender), colour rules (colour)
  ▼
buildRolePools                               (rest of wardrobe, by role, max 60 each)
  ▼
for each outfit shape that has a slot for newItem's role:
  findShapeCombinations                      (backtracking search, pruned as it goes)
    each candidate added must pass:
      fits the shape (layering rules) → compatible with every item so far
      → colour → pattern → season → tag
  ▼
score every item-set found                   (computeOutfitScore)
  ▼
best score first, until 100,000 are kept or the score drops below 60:
  skip if already saved
  describeOutfit   → temperature (from subtypes) + season + tag + descriptive fields
  validateOutfit   → final safety re-check (compatibility, layering, pattern, colour)
  ▼
Match.insertMany in chunks of 5,000, best first   (stops near the Vercel deadline;
                                                     duplicates from overlapping runs skipped)
```

### 4.2 Setup

1. If the item's `type` isn't one of the four roles, stop.
2. Load in parallel:
   - preferences (`getUserMatchingPreferences`) → gender, colour,
     temperature;
   - personal adjustments (`loadUserAdjustments`) → a `Map` of
     `"A B" → adjustment`;
   - the user's existing matches, as sorted-clothing-id keys.
3. `buildMatchingContext` works out, once for the run:
   - `baselineMatrix = getBaselineMatrix(gender)`
   - `layeringRules = getLayeringRules(gender)` (both lists in 3.5)
   - `colorRules = getColorRules(colour)`

### 4.3 Role pools

`buildRolePools` sorts every **other** wardrobe item into `top`, `bottom`,
`onepiece` and `outer` pools. Each pool keeps at most
**`MAX_POOL_SIZE_PER_ROLE` = 250** items: the first 250 the database returns.
Items past that are never considered as partners.

### 4.4 The search

For every shape with a slot for the new item's role
(`findShapeCombinations`):

1. **Work out what's still needed.** The new item fills one slot of its
   role. For example, a new top in shape 7 (2 top, 1 bottom, 1 outer) still
   needs 1 top, 1 bottom and 1 outer.
2. **Shape-level early exit** (`fitsShape`). Skip the shape if the new item
   can't fill its slot: it requires layering and the shape has one slot
   for its role, or it requires a top and the shape has none.
3. **Check the new item on its own.** If it fails colour/pattern/season/tag
   by itself, skip the shape. For example, a single item with 5 colours at
   `min` level fits no palette, and an untagged item has no tag to share.
4. **Backtracking.** Go through the roles in order (top, bottom,
   onepiece, outer), choosing the needed number from each pool, without
   repeats. Each time a candidate is considered:
   1. Stop if the search limits are used up (below).
   2. **Fits the shape** (`fitsShape`), as in step 2.
   3. **Compatibility.** The candidate must be compatible (`isCompatible`)
      with **every** item already chosen, including the new item. One
      incompatible pair rules it out.
   4. **Colour + pattern + season + tag.** The items chosen so far plus the
      candidate must still pass all four (`isStillViable`).
   5. If it passes, choose it and carry on.

These checks are **monotonic**: once a partial outfit fails one, adding more
items can never make it pass. So a failing branch is dropped immediately
instead of being built out in full.

**Search limits**, shared across all shapes in one run:
`MAX_COMBINATIONS_EXPLORED` = 2,000,000 candidate considerations, or
`SEARCH_TIME_LIMIT_MS` = 60 seconds, whichever comes first. When a limit is
hit, the best outfits found so far are still kept. The limits are sized so
matching is **complete** for a ~330-item wardrobe (4x an 83-item test
wardrobe): its worst single item needed ~1.7M considerations, ~5s of
search, ~7s including scoring, and produced ~90,000 outfits. 60s leaves
most of Vercel Hobby's 300s function limit for scoring and saving.

On Vercel the search also stops **`SAVE_RESERVE_MS` = 60 seconds** before
the invocation's real deadline (`getDeadline()` from `@vercel/functions`,
wrapped in `server/utils/functionDeadline.js`), however much of the
function's time the request itself used. Outside Vercel there is no
deadline.

### 4.5 Choosing and finishing outfits

1. **Score** every item-set found (3.10).
2. Go through them **best score first** (equal scores keep the order they
   were found in), until **`MAX_NEW_MATCHES_PER_ITEM` = 100,000** are kept,
   or the score drops below **`MIN_AUTO_MATCH_SCORE` = 60**
   (`server/constants/scoring.js`). Lower-scoring outfits are never saved
   automatically; outfits the user builds have no minimum.
   1. Skip it if the same set of clothes is already saved, or already
      kept in this run.
   2. **`describeOutfit(items, { isUserMade: false, temperaturePreference })`**
      - Temperature range, from the subtypes (3.9). Never rejects.
      - Builds the match fields:

        | Field | Value |
        |---|---|
        | `clothes` | item ids |
        | `type` | `"match"` |
        | `colors` | union of item colours |
        | `styles` | union of item styles (e.g. `["Plain", "Patterned"]`) |
        | `tags` | tags held by **every** item (`computeMatchTags`) |
        | `min_temp` / `max_temp` | whole numbers, from `computePresetTemperatureRange` |
        | `spring`…`winter` | true only if every item has that season |
        | `topCount` / `bottomCount` / `onepieceCount` / `outerCount` | role counts |
        | `hasOuter` | `outerCount > 0` |

   3. **`validateOutfit`** re-runs the full compatibility check, the
      layering rules, pattern and colour. By construction this always
      passes. It is kept as a safety net.
   4. The match is given its `score`, `userMade: false`,
      `favourite: false`, `lastWornDate: null`.

**Items that never match automatically.** An item is never matched if its
subtype isn't in the current gender's matrix (for example, it was added
under another gender, or the subtype was renamed), or if it has no tags.

### 4.6 Saving

The kept outfits are saved best first, **`INSERT_CHUNK_SIZE` = 5,000** at
a time (`saveMatchesBestFirst`). Before each chunk, if less than
**`INSERT_STOP_MARGIN_MS` = 15 seconds** of the Vercel deadline is left,
saving stops with a warning in the logs - the best outfits are already
saved. Nothing is ever removed or updated here. Automatic matching only
adds.

**No duplicate outfits.** Every match has a `clothesKey`: its sorted
clothing ids as one string (`server/utils/clothesKey.js`), set
automatically before every save by a hook on the Match model. The index
`{ userId, clothesKey }` is unique, so the same outfit can't be saved twice
even when two matching runs overlap (two quick edits, or several items
added at once). The second copy is rejected by the database and skipped
(`isOnlyDuplicateKeyErrors`); any other save error is still thrown. If a
user builds an outfit at the same moment a run saves it, Build Matches
gets the usual 409 "Match already exists."

---

## Part 5 - Outfits the user builds (Build Matches)

Files: `src/components/matches/createMatch.jsx`, `createMatch` in
`server/controllers/allControllers.js`.

### 5.1 Request

1. The page loads the wardrobe grouped by role. The user can select any
   number of items in any roles. There are **no shape limits** here.
2. Only the clothing ids are sent: `POST /match/matches { clothes: [...] }`.

### 5.2 A new outfit

1. All ids must belong to the user. Otherwise 400.
2. `describeOutfit(items, { isUserMade: true, ... })`:
   - **No compatibility, layering, colour or pattern checks.**
   - The temperature range comes from the subtypes, like any other match.
   - Seasons are still computed. With no shared season the outfit is
     saved with every season false, so it never appears on the Today
     page.
   - Tags are never a reason to reject it. The outfit gets the tags every
     item shares; with none shared it's saved with no tags.
3. Saved with `userMade: true` and **`score: 90`**.
4. **Learning:** `recordOutfitCreated` adds **+5** to every compatible pair
   in the outfit (Part 6).

### 5.3 Rebuilding an existing outfit

- **Already user-made** → 409 "Match already exists."
- **An automatic match** → the user **claims** it: it becomes
  `userMade: true`, its score changes to **90**, and `recordOutfitClaimed`
  adds **+5** to its pairs. The claimed match is returned. Apart from
  rejecting it on the Today page (7.2), this is the only time a match's
  score changes after creation.

---

## Part 6 - How the app learns from the user

Files: `server/services/matchScoreService.js`,
`server/services/matchLifecycleService.js`, `updateMatch` in
`server/controllers/allControllers.js`. Numbers in
`server/constants/scoring.js` (`LEARNING_DELTAS`).

### 6.1 What changes a personal adjustment

| Event | Change to every compatible pair in the outfit |
|---|---|
| User builds an outfit (Build Matches) | **+5** |
| User claims an automatic outfit by rebuilding it | **+5** |
| User favourites an outfit | **+3** |
| User unfavourites an outfit | **−3** |
| User deletes one outfit (match card or Today → delete) | **−2** |
| User deletes a clothing item (its outfits are deleted with it) | none |
| Delete-by-piece (`deleteMatchesByPiece`, no route currently) | none |
| Marking as worn, editing a match's range | none |
| Rejecting an outfit on the Today page (7.2) | none - only that match's own score drops |
| Gender changes | **all** personal adjustments deleted |
| Automatic matching creating an outfit | none |

"Every compatible pair" means every two items in the outfit that could be
matched (3.3). Incompatible pairs in a user-built outfit (e.g. two bottoms,
or two of the same subtype) are skipped and nothing is stored for them.

Favouriting is detected in `updateMatch` when `favourite` actually changes,
so toggling on and off adds and removes the same 3 points.

### 6.2 How adjustments are stored

- `MatchScore` stores one **adjustment** per user and subtype pair (names
  in alphabetical order), only once something has changed it.
- **Pair score = baseline + adjustment, kept between 0 and 100.**
- The adjustment itself is **limited when it's saved**, so baseline +
  adjustment can't go past 100 or below 0. A pair at 95 built ten times
  stays at 100, and the first deletion brings it straight down to 98 - no
  hidden reserve builds up.

### 6.3 What this does

- **Ranking only.** Adjustments change how future automatic outfits are
  scored, which decides which 100 are saved and how the Today page orders
  them. They **never** decide whether a pair can be matched.
- **Only future matches change.** A match's score is set when it's
  created, so changing an adjustment never changes existing matches. The
  new pair scores are used the next time `processMatches` runs, when an
  item is added or edited.

---

## Part 7 - Showing and sorting by score

### 7.1 The Today page

`src/components/today/todayOutfitSort.jsx`. Outfits with today's tag still
come first. Within each group, outfits are sorted by a weighted total of
factors that each run from 0 to 10:

| Factor | Weight |
|---|---|
| Temperature fit | 0.10 |
| Clothing freshness | 0.30 |
| Outfit freshness | 0.20 |
| **Match score** (`score` ÷ 10, or 10 for a favourite) | **0.40** |

The match score comes from `getEffectiveMatchScore` in
`src/utils/matchScore.js`, which returns 100 for a favourite and the stored
score otherwise.

The page shows one outfit at a time with ‹ / › arrows (wrapping round at
either end), and the "Filter by Tag" panel beside it. The filter starts on
today's weekly-preference tag (click it to clear), with a
"Today's <tag> outfit" subtitle under the panel title.

### 7.2 Rejecting an outfit

Files: `server/services/matchRejectionService.js`,
`src/components/today/outfitRejection.js`, `rejectMatch` and `createToday`
in `allControllers.js`. Numbers in `server/constants/scoring.js`.

- Pressing **›** rejects the outfit being left (`PUT /match/:id/reject`),
  including favourites, the last outfit when it wraps round, and while a tag
  filter is on. ‹ never rejects.
- A rejection counts **at most once per outfit per day**: `rejectedCount`
  +1, `lastRejectedDate` = now, and the stored `score` drops by
  **`REJECTION_SCORE_PENALTY` = 3** (never below 0). The client sends no
  request once the outfit's `lastRejectedDate` is today; the server ignores
  a repeat anyway.
- **`createToday`** leaves out outfits rejected in the last
  **`REJECTION_COOLDOWN_DAYS` = 5** days - one rejected on the 2nd is
  hidden up to and including the 7th. If every outfit for today's weather
  was rejected recently, none are left out. Today's list is built once a
  day, so an outfit rejected today stays reachable with ‹ until tomorrow.
- **Marking as worn** an outfit rejected today undoes the rejection
  (count −1, score +3, `lastRejectedDate` back to null). The previous
  rejection date isn't kept, which doesn't matter: anything rejected in the
  5 days before wasn't in today's list to wear. Switching the worn outfit
  to another one later doesn't re-apply the rejection.
- "Today" is the user's local day: the client sends its local midnight
  (`todayStart` / `today_start`); the server falls back to its own.

### 7.3 Temporary score display

`src/components/general/matchScoreBadge.jsx` shows a small grey "Score N"
on the match cards (`viewMatchesCard.jsx`) and on the Today page's main
outfit (`viewToday.jsx`). It's for testing only - delete the component,
its CSS and its three usages to remove it.

---

## Part 8 - Worked example

A woman, colour **mid**, temperature **normal**. Her wardrobe already has:

| Item | Subtype (role) | Colours | Seasons | Tags |
|---|---|---|---|---|
| Cream wideleg trousers | Wide leg trousers (bottom) | Cream | all | Work, Everyday |
| Camel trench coat | Trench coat (outer) | Camel | Spr/Aut/Win | Work, Everyday |
| Brown light cardigan | Light cardigan (top) | Brown | all | Everyday |

**Adding the item.** She types "Cream and gold buttondown shirt". The
suggestions include **Buttondown shirt** (keyword `"buttondown shirt"`),
and she picks it. Clicking Next fills in:

- colours **Cream, Gold** (from the name) → style **Patterned**
- seasons **Spring, Autumn, Winter** and tags **Work, Wedding, Date night,
  Everyday** (from the subtype)

She saves. The item passes every check and is stored, and `processMatches`
starts.

**Compatibility.** Buttondown shirt + Wide leg trousers, + Trench coat and
Wide leg trousers + Trench coat are "always" role pairs. Buttondown shirt +
Light cardigan is a top+top pair the woman matrix allows. Cream, Gold,
Brown and Camel all fit inside the mid palette
`["Cream", "Camel", "Tan", "Gold", "Brown"]`. Only one item (the shirt) is
patterned. Spring, Autumn and Winter are shared by everything, and so is
the **Everyday** tag. Outfits without the cardigan also share **Work**, so
they're tagged `Work, Everyday`. Outfits with the cardigan are tagged
`Everyday` only.

**Scores.** woman matrix:

| Pair | Score |
|---|---|
| Buttondown shirt + Wide leg trousers | 92 |
| Buttondown shirt + Trench coat | 92 |
| Buttondown shirt + Light cardigan | 85 |
| Light cardigan + Wide leg trousers | 84 |
| Light cardigan + Trench coat | 68 |
| Wide leg trousers + Trench coat | 90 |

| Shape | Items | Score | Temperature | Result |
|---|---|---|---|---|
| 4 (1 top, 1 bottom) | shirt + trousers | 92 | 14–22 | **saved** |
| 5 (+1 outer) | shirt + trousers + trench | 0.7 × 91.3 + 0.3 × 90 ≈ **91** | 9–18 | **saved** |
| 6 (2 tops, 1 bottom) | shirt + cardigan + trousers | 0.7 × 87 + 0.3 × 84 ≈ **86** | 14–18 | **saved** |
| 7 (2 tops, 1 bottom, 1 outer) | shirt + cardigan + trousers + trench | 0.7 × 85.2 + 0.3 × 68 ≈ **80** | 6–14 | **saved** |

All four are within the best 100, so all are saved, each with its score.
"View New Matches" polls until they appear.

**Learning.** She deletes the 4-item outfit. Each of its 6 pairs gets −2,
so Wide leg trousers + Trench coat drops from 90 to 88. **Nothing stops
matching** - the trousers and coat are still compatible, and the 3-item
shirt + trousers + trench outfit keeps its score of 91. Future outfits
with that pair just score slightly lower. If she favourites the 3-item
outfit, it shows as 100 and its 3 pairs get +3.

---

## Part 9 - Things noticed while documenting

These are behaviours found in the code that may not be intended.

1. **Item names containing a tag word fail to save.** `detectFromName`
   returns the matching **tag objects** (`{ name, image }`), not tag names
   (`uploadHelpers.jsx`, `detectedTags`). They are merged into `tags`
   alongside strings. Mongoose can't cast an object to a string, so saving
   fails with a 500 "Cast to [string] failed". This affects names such as
   "Work blazer", "Party top", "Beach shorts", "Gym leggings" and "Everyday
   tee". The objects are also invisible on page two (`includes(tag.name)`
   doesn't match an object), so the user can't remove them. Verified
   against Mongoose 9 with a standalone schema.
2. **Duplicate items look like a successful save.** When `createItem` finds
   an item with the same name and type, it responds **200** with
   `{ error, item }`. The client treats that as success: it shows "Item
   created", `justSavedItem.id` is `undefined` (so "View New Matches" opens
   `?item=undefined`), and the image just uploaded to Cloudinary is never
   cleaned up.
3. **The pattern preference isn't used.** `preferences.pattern` is
   calculated by the quiz and required by the quiz gate, but no matching
   code reads it. Everyone gets "max 1 patterned item".
4. **"Patterned" is just "2+ colours".** A colour-block or two-tone item
   counts as patterned. With the substring detection in 1.3, so does
   anything named "Forest green …", "Olive green …" or "Lime green …".
5. **Changing gender** wipes personal adjustments. Existing items whose
   subtypes aren't in the new gender's list stop being matched.
6. **Palettes reference colours that can't be picked.** `Coral` and
   `Kharki` appear in the palettes but not in `colorOptions`. They do no
   harm, but they make some palettes effectively one colour smaller. The
   last palette in the `max` list is also an exact copy of an earlier one.
7. **Matching runs after the response is sent.** It's kept alive with
   `waitUntil`, but the client polling (8 × 1 s) can finish before a large
   run has saved its matches, so new matches may only show on a later
   load.
8. **Three colour-palette tests fail** (`styleColorService.spec.js` ×2 and
   the colour-cap test in `matchService.spec.js`). They were failing before
   the matching overhaul - the palette data no longer contains the
   combinations the tests expect.

---

## Part 10 - Why it works this way

Decisions made when matching was redesigned (October 2026), so they aren't
undone by accident:

- **Compatibility and score are separate.** Previously one number per pair
  did both, so deleting a few outfits could stop a pair matching at all,
  and pairs started with very different "lives". Now compatibility is a
  fixed yes/no and the score only ranks.
- **Nothing the user does can make a pair match or stop matching.**
  Building an outfit with an incompatible pair saves that outfit (user-built
  outfits are never checked) but doesn't teach automatic matching to
  produce it.
- **No style archetypes.** One matrix per gender. The quiz images now only
  decide colour and pattern.
- **One matrix file per gender, not a separate yes/no file.** Benchmarking
  showed the pair lookup is a small part of matching time (colour checks
  dominate), so a separate file would add maintenance without speeding
  anything up. `null` vs a number encodes the yes/no.
- **The per-pair yes/no decisions** for top+top, outer+outer and
  top+onepiece were made by hand and live only in the matrix files (as
  `null` or a score). A few non-obvious ones:
  - Linen shirt + Short t-shirt is allowed but Linen shirt + Long t-shirt
    isn't - deliberately.
  - Turtleneck jumper + any other jumper, and any jumper + Croptop, never
    match.
  - Romper never pairs with a top. Men's Waistcoat + Romper/Overalls was
    left undecided and defaults to no.
- **A match's score is set at creation.** Matches aren't re-scored
  when the user's adjustments change. The exceptions are claiming an
  automatic outfit (it becomes 90) and rejecting it on the Today page
  (−3 per day it's rejected, 7.2).
- **Only the best 100 new outfits per item are saved**, rather than
  whichever the search happened to find first.
- **Temperature belongs to matches, not items.** Item ranges were removed;
  a match's range comes from preset groups and points
  (`temperature-ranges.md`).
- **Renames and merges:** Demin jacket → Denim jacket, Short Turtlneck →
  Short turtleneck, Long-tshirt → Long t-shirt, Wideleg trousers → Wide leg
  trousers; Beige → Cream, Lavender → Lilac; Chinos removed for women
  (existing ones become Cropped trousers).

---

## Part 11 - One-off database scripts

All in `server/scripts/`. Each reads `MONGO` from `server/.env`. Run from
the project root with `node server/scripts/<name>.js`.

| Script | What it does | Safe to run again? |
|---|---|---|
| `matchingOverhaulMigration.js` | Renames the first set of subtypes, men's Waistcoat → top, removes the old `style` preference, **deletes all personal score adjustments**, reports matches without a score | Steps 1-3 and 5 yes; **step 4 no** - it would wipe learned adjustments |
| `removeClothingTemperatures.js` | Removes `min_temp`/`max_temp` from clothing items (`--backup <file>` saves them first) | Yes |
| `resetMatchTemperatures.js` | Recalculates every match's temperature range from the current presets (`--dry-run`, `--backup <file>`). Also overwrites ranges edited by hand | Yes - run it after changing `temperatureGroups.js` |
| `renameWideLegTrousers.js` | Wideleg trousers → Wide leg trousers on items and score adjustments | Yes |
| `replaceWomensChinos.js` | Women's Chinos items → Cropped trousers | Yes |
| `mergeColours.js` | Beige → Cream and Lavender → Lilac on items and matches (an item left with one colour becomes Plain) | Yes |
| `addMatchClothesKey.js` | Sets `clothesKey` on every match and builds the unique `{ userId, clothesKey }` index. Lists any duplicate outfits and changes nothing if there are some | Yes |

All of these have been run on the current database.

---

## Where to change things

| What | Where |
|---|---|
| Subtypes and their default seasons/tags/category | `src/constants/typeOptions.jsx` (+ `shared/subtypesByGender.json`, see `adding-a-subtype.md`) |
| Extra words for subtype suggestions | `SUBTYPE_SYNONYMS` in `uploadHelpers.jsx` |
| Selectable colours / tags | `colorOptions` / `tagOptions` in `src/constants/optionsBank.jsx` |
| Name → colour/season/tag detection | `detectFromName` in `uploadHelpers.jsx` |
| Other words for a colour ("beige" → Cream) | `COLOR_NAME_ALIASES` in `uploadHelpers.jsx` |
| Plain/Patterned rule | the `styles` effect in `addUpdateClothes.jsx` |
| Style quiz images and what they mean | `styleImageOptions` in `src/constants/styleQuizOptions.js` |
| Tie-break order | `levelPriority` in the same file |
| Role rules (never / always / decided) | `server/constants/compatibilityRules.js` |
| Pair compatibility and baseline scores | `server/constants/matrices/<gender>.js` |
| Tops that need layering / onepieces that need a top | `server/constants/requiresLayering.js` |
| Outfit score blend, single-item / user-made scores, learning steps | `server/constants/scoring.js` |
| Allowed outfit shapes | `server/constants/outfitShapes.js` |
| Colour palettes and colour caps | `server/utils/colorPalettes.js` |
| Patterned-item limit | `passesPatternCheck` in `server/services/styleColorService.js` |
| Search limits and best-N | `MAX_POOL_SIZE_PER_ROLE`, `MAX_COMBINATIONS_EXPLORED`, `SEARCH_TIME_LIMIT_MS`, `MAX_NEW_MATCHES_PER_ITEM` in `matchService.js` |
| Lowest score an automatic outfit is saved at | `MIN_AUTO_MATCH_SCORE` in `server/constants/scoring.js` |
| Time kept for saving / save chunk size | `SAVE_RESERVE_MS`, `INSERT_CHUNK_SIZE`, `INSERT_STOP_MARGIN_MS` in `matchService.js` |
| Default gender when missing | `DEFAULT_GENDER` in `matchScoreService.js` |
| Today page weights | `SCORE_WEIGHTS` in `todayOutfitSort.jsx` |
| Rejection penalty / days a rejected outfit is hidden | `REJECTION_SCORE_PENALTY`, `REJECTION_COOLDOWN_DAYS` in `server/constants/scoring.js` |
| Favourite score | `FAVOURITE_SCORE` in `src/utils/matchScore.js` |
| Temperature numbers | `server/constants/temperatureGroups.js`, see `temperature-ranges.md` |
| Remove the temporary score display | see 7.3 |
| One-off database updates | `server/scripts/`, see Part 11 |

Tests: `server/specs/` (`matchService`, `matrixService`,
`outfitScoreService`, `outfitEvaluator`, `styleColorService`,
`matchScoreService`, `matchScoreBaseline`, `matchRejectionService`,
`presetTemperatureService`,
`temperatureService`,
`colorPalettes`). Run them with `cd server && node --test specs/*.spec.js`.
