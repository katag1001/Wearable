# Adding clothes and matching outfits

This walks through the whole flow, from a user adding a clothing item to
outfits (matches) being created from it. It covers:

1. How an item is added, and which fields are filled in automatically.
2. How an item is checked ("approved") before it is saved.
3. The user's preferences, and where each one is used.
4. How outfits are matched automatically, check by check, and scored.
5. How outfits the user builds by hand differ.
6. How the app learns from what the user builds, favourites and marks as a
   mismatch.
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
  its subtypes. Every candidate gets a **pair score** and a **colour score**
  (number of colours, how classic or bold its palette is, the user's
  favourite palettes, bright colours, whether plain pieces echo the
  pattern's colours). If either is below 65, or any one
  pair is below 50, it's dropped. The rest get a **score (0-100)** from both,
  and only the **best** new ones are saved.
- **Compatibility is fixed.** Role rules plus the gender's matrix decide
  whether two items can ever be in the same outfit. User behaviour never
  changes it - except **Mismatch** on the Today page, which stops two
  specific items ever being matched together (7.3).
- The **matrix** used depends on the user's gender. The **colour palettes**,
  colour cap and colour score depend on their colour level. Both come
  from the style quiz, as do the user's favourite palettes.
- User-made outfits are **never rejected** and always score 95. Building
  one (+3) or favouriting (+3) adjusts the user's personal score for every
  compatible subtype pair in it; marking a mismatch (−5) adjusts just that
  one pair. Deleting outfits changes nothing. That changes how future
  automatic outfits are **scored and ranked**, never whether they are
  allowed.
- **Favourite clothing items** add **+7** (once per outfit) to the score of
  every automatic outfit they're in, never above 90 - only after the
  outfit has been chosen, so a favourite never lets a weaker outfit in
  (3.11).

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
  `"Tank top"` → `Tan`, `"Embroidered blouse"` → `Bright Red`, `"Golden …"` →
  `Gold`.
- Some other words count as a colour (`COLOR_NAME_ALIASES`): `"beige"` →
  `Cream`, `"lavender"` → `Lilac`, `"maroon"` → `Burgundy`, and
  `"cobalt"`, `"royal blue"`, `"electric blue"` → `Bright Blue`, and
  `"red"` → `Bright Red`. Beige and Lavender were merged into those
  colours and Maroon and Red were renamed, so they can't be picked any
  more. An alias inside a colour already found doesn't count, so
  `"Deep red dress"` is only `Deep Red`.
- There is no plain "Red" either: `Bright Red` (what Red used to be) and
  `Deep Red`.
- There is no plain "Blue". Only `Bright Blue`, `Dark Blue`,
  `Light Blue`, `Navy`, `Teal` and `Turquoise` exist, so `"Blue jeans"`
  detects no colour. The
  user has to pick one, because page two needs at least one colour.

The user can correct all of this on page two.

### 1.4 Page two: the user reviews

`modalTwo.jsx` shows everything filled in above, and the user can change any
of it:

- **Seasons.** Checkboxes (`toggleSeason`).
- **Colours.** A grid of the 28 `colorOptions` (`toggleColor`).
- **Tags.** The 10 `tagOptions`: Work, Gym, Loungewear, Party, Date night,
  Formal, Beach, Outdoor, Dinner, Everyday.

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
4. **Old image cleanup (edits only).** If the image was replaced, the
   server deletes the old one as part of `PUT /clothing/:id`
   (`deleteReplacedImage`, `server/services/imageService.js`).
5. **On failure.** If the save fails after the image was uploaded, the new
   image is deleted again via `POST /cloudinary/delete`, so Cloudinary
   doesn't keep orphans. That endpoint only deletes an image no clothing or
   footwear item uses, so it can't remove anyone's saved image.
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
edit, but only when a matching field changed (see 1.8).

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
- If no field matching reads changed (`type`, `subtype`, `colors`,
  `styles`, `tags`, the four seasons, `wearWithTights`) - e.g. only the
  name - nothing else happens.
- Otherwise `refreshMatchesForItem` (`server/services/matchRefreshService.js`)
  runs before the response:
  - **Protected** outfits are never deleted or re-scored
    (`server/services/matchProtection.js`): favourites, user-made, worn
    (`lastWornDate` set or `timesWorn > 0`), or changed by hand
    (`userEdited` - set by a real change on the outfit's edit page, too
    hot / too cold, or "not with tights" for that outfit). This holds for
    all of the app's automatic rematching; the scripts in Part 11 are
    separate.
  - **Rematch** - a change to `type`, `subtype`, `colors`, `styles`,
    `tags` or a season (`REMATCH_ITEM_FIELDS`): every unprotected outfit
    with the item is deleted, valid or not, so the search below builds
    them all again with new scores.
  - **Re-check** - any other change (the tights answer): each outfit is
    re-checked against the search's rules (shape, compatibility, layering,
    colour, pattern, shared season, shared tag), and the unprotected ones
    that no longer pass are deleted.
  - Deleting lowers no pair scores and takes the outfit's Today entries
    with it.
  - Every kept outfit has only the fields fed by the changed item fields
    rewritten (`ITEM_FIELD_TO_OUTFIT_FIELDS`: a season → that season,
    colours/styles/tags → the same field, subtype → temperature range,
    type → temperature range and role counts). Manual edits to the
    outfit's other fields survive. Score, rejections and wear history are
    never changed.
- Then `processMatches` runs again for the item in the background and adds
  outfits that don't exist yet (so a protected outfit isn't duplicated).
  It has the usual limits (4.5), so it may not find exactly the outfits
  that were deleted.

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

The quiz has four steps, plus favourite palettes, and pairing questions for
women and unisex:

1. **"How do you usually dress?"**: More feminine → `woman`, More unisex →
   `unisex`, More masculine → `man`. Saved as `gender`.
2. **"Select all that apply"**: a grid of style images. Only images whose
   `gender` list includes the chosen gender are shown. At least one image
   must be picked.
   - **"Pick the colours you love"** (`PalettePicker.jsx`): the palettes at
     the colour level the images give (2.2), classic first, as swatches.
     Optional - pick any number, or skip. Saved as `favouritePalettes`
     (palette ids). See 3.10.
   - **Pairing questions** (`woman` and `unisex` only,
     `PairingQuestionStep.jsx`): one Yes / Sometimes / No question per
     screen, each with a row of images. See 2.6.
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

`PUT /preferences` is sent with `{ gender, colour, pattern, temperature,
favouritePalettes }`.

### 2.3 Changing preferences later

`stylePreferences.jsx` (on the user page) lets the user change gender and
temperature, and optionally re-pick images. Colour and pattern are only
re-calculated and sent **if at least one image is selected**. Otherwise
they stay as they were. Unlike the quiz, this page shows all 9 images
regardless of gender.

It also shows the **favourite palettes** ("Colours you love"), loaded from
the saved preferences. The palettes offered are the newly picked images'
colour level, or the saved level if no images are picked, plus any palette
already picked from another level. The whole list is sent on every save.

For `woman` and `unisex` (the gender currently picked on the page) it
also shows the pairing questions (2.6) under their section headings,
without pictures (`PairingPreferences.jsx`). Answers aren't stored, so
they always start unanswered; only the questions answered are sent, and
clicking the selected answer again clears it.

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
| `colour` | min / mid / max | Which colour palette list is used, the colour-count cap, and the colour score (3.10) | `getColorRules`, `computeColourScore` |
| `favouritePalettes` | palette ids | Outfits fitting one get +8 on their colour score (3.10). Unknown ids are dropped on save (`cleanFavouritePalettes`) | `computeFavouriteBonus` |
| `pattern` | min / mid / max | How strongly the pattern echo adjustment rewards/penalises colours added to a patterned item (3.10). Missing → mid. The pattern rule itself is the same for everyone (3.7). | `computePatternEchoAdjustment` |
| `temperature` | cold / normal / hot | Shifts every new match's temperature range ±2° | `temperature-ranges.md` |
| `pairingAnswers` (quiz only, not stored) | question key → yes / sometimes / no | Sets the starting personal adjustment of the question's pairs (2.6) | `pairingQuizService.js` |
| `monday` … `sunday` | a tag name | That day's tag is used to put matching outfits first on the Today page | `server/services/todayRankingService.js` |

### 2.5 Defaults when something is missing

`getUserMatchingPreferences` (`server/services/matchScoreService.js`) is
the single place the server reads these:

- gender missing → `unisex`
- colour missing → `mid` palettes (`DEFAULT_COLOUR_LEVEL`)
- temperature missing → treated as `normal`

`getBaselineMatrix(gender)` falls back to the **unisex** matrix for an
unknown gender.

### 2.6 Pairing questions

Files: `src/constants/pairingQuestions.js` (text, headings, images),
`server/constants/pairingQuestions.js` (which pairs each question sets),
`server/services/pairingQuizService.js`. The keys must match.

| Key | Question | Pairs |
|---|---|---|
| `shirtsOverTops` | Do you like shirts over tops? | Buttondown shirt, Linen shirt × Short t-shirt, Long t-shirt, Vest, Croptop, Bodysuit, Fancy top |
| `turtlenecksUnderShirts` | Do you like turtlenecks under shirts or blouses? | Short/Long turtleneck × Buttondown shirt, Linen shirt, Floaty blouse, Fancy blouse |
| `topsUnderDresses` | Do you like t-shirts or turtlenecks under dresses? | Short/Long t-shirt, Short/Long turtleneck × every dress |
| `smartAndCasual` | Do you like to mix smart and casual? | Hoodie × Blazer, Trench coat, the skirts; Blazer, Trench coat × Sweatpants, Leggings; Cargo pants × Fancy top, Fancy blouse, Blazer |
| `croptopsLowRise` | Do you like croptops with low-rise bottoms? | Croptop × Low waist jeans |

The first three are under "A few layering questions...", the last two
under "And a couple about mixing styles...".

The quiz sends the answers with `PUT /preferences` as `pairingAnswers`.
They aren't stored on preferences. Instead every pair in an answered
question has its personal adjustment **set** (not added) to
`PAIRING_ANSWER_ADJUSTMENTS`: **Yes +10, Sometimes −10**, limited so the
pair score stays within 0-100, and **No takes the pair score to 0**.
Retaking the quiz overwrites those pairs again. Pairs the matrix doesn't
allow (`null`) are skipped, so an answer never changes compatibility.

"No" goes all the way to 0, below `MIN_PAIR_SCORE` (50), so the search
drops any outfit with that pair (4.4) and it's never suggested
automatically. It can still be built by hand, and building or
favouriting it lifts the pair again. The answers are applied after a gender-change wipe, so they
survive a gender change made in the same save; a later gender change
deletes them with every other adjustment. Men are never asked, and the
server ignores answers for them.

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
nothing the user does can make a pair of subtypes match or stop matching.
A subtype not in the user's gender matrix is never compatible.

**Mismatched items.** Separately, two specific clothing items the user
marked as a mismatch on the Today page (7.3) are never put in the same
automatic outfit: `areMismatched` (`server/services/mismatchRules.js`)
is checked next to `isCompatible` in the search (`pairsWithAll`) and in
`validateOutfit`. It reads each item's `mismatchedWith` list. Outfits the
user builds never check it.

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

`shared/colorPalettes.json` (read by `server/utils/colorPalettes.js` and,
in the browser and app, `core/utils/colourPalettes.js`) holds one list of
palettes. Each is `{ id, tier, levels, colours }`:

- `id`: stable name. Users' `favouritePalettes` point at it, so an id must
  never change once it's live.
- `tier`: `classic`, `common` or `bold` - only affects the score (3.10).
- `levels`: which colour levels use it.
- `colours`: names from `colorOptions`.

| Level | Palettes | Max distinct colours in an outfit |
|---|---|---|
| min | 39 | 4 |
| mid | 68 | 6 |
| max | 79 | no cap |

An outfit passes if **all of its colours together fit inside at least one
of its level's palettes**, and the number of distinct colours is within
the cap. This is pass/fail; the tiers only rank outfits that pass.

A palette can be bigger than its level's cap. The cap limits how many of
its colours one outfit uses, not the size of the palette.

The levels only grow: every `min` palette fits inside some `mid` palette,
and every `mid` palette fits inside some `max` palette. A palette *can*
fit inside another one at the same level, but only if its tier is
different - otherwise it adds nothing (same pass/fail, same score) and
should be removed. The classic combinations (Brown + Tan + Olive Green,
Light Blue + Grey + White, Burgundy + Cream/Tan + Grey,
Burgundy + Black + Grey, Black + Bright Red + White) are their own `classic`
palettes at every level.
Navy + Cream + White, Brown + Cream + Olive Green and Black + White + Tan
don't need their own: bigger `classic` palettes already contain them at
every level.

Dark Blue, Light Blue, Navy, White and Deep Red are a `classic` palette at
every level (`navy-blues-deep-red`) - the only one with Deep Red so far.
Black + Dark Blue + White has no palette of its own.

Bright Blue has its own palettes: with White, Navy and Light Blue at every
level; with Grey and Black at every level; with Camel/Cream/Tan, and with
Turquoise/Teal at mid and max; and bold contrasts (Orange, Yellow, Bright Red, Fuchsia) at max only.

Copper (a warm metallic, not a bright colour) has its own palettes too:
with Cream/Brown/Camel (classic), Olive Green/Cream/Tan and
Black/Burgundy/Cream at every level; with Navy/Cream/White (classic),
Peach/Pink/Cream and Teal/Cream/Brown (bold) at mid and max; and Forest Green/Burgundy/Gold and
Turquoise/White/Navy (bold) at max only.

The server refuses to start if a palette has a duplicate id, an unknown
tier or level, or no colours (`checkPalettes`). The tests also check every
colour is in `colorOptions` and the levels only grow.

Colours don't need to be close to each other. They just need to appear
together in some palette. For example, Bright Red + Orange isn't allowed at `min`,
but is allowed at `mid` and `max`. Black + Purple is only allowed at `max`.
Black + Pink isn't allowed at any level.

### 3.7 The pattern rule

`passesPatternCheck`: **at most one patterned item per outfit.** "Patterned"
means the item has 2 or more colours (1.4). This is the same for every user.
The `pattern` preference doesn't change it - it only sets the strength of
the pattern echo adjustment in the colour score (3.10).

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
claiming it, 5.3, rejecting it on the Today page, 7.2, or favouriting /
unfavouriting one of its items, 3.11):

| Match | Score |
|---|---|
| Automatic, 2+ items | **50% × pair blend + 50% × colour score**, rounded, capped at **90** (`MAX_AUTO_SCORE`) so automatic outfits always rank below user-made ones. Only saved if the pair blend and the colour score are **both at least 65** (`MIN_AUTO_SCORE`, 4.5) |
| Automatic, single item (a onepiece alone) | **85** (no colour score, never dropped) |
| User-built, or a claimed automatic match (5.3) | **95** |

Because the final score is a weighted average of two numbers that are both
at least 65, every saved automatic outfit scores at least 65.

#### Pair blend

A **pair score** is the matrix baseline plus the user's personal
adjustment (Part 6), kept between 0 and 100.

**Pair blend** = 70% × average pair score + 30% × lowest pair score - unless
**any pair is below 50** (`MIN_PAIR_SCORE`), in which case the pair blend
*is* that pair's score, so the outfit always fails. Without that, one bad
pair gets diluted: pairs of 90, 90 and 45 would blend to 66 and pass. The
search drops such an outfit the moment the bad pair appears (4.4).

#### Colour score

`computeColourScore`. A colour on several items counts once.

**colour score = (colour-count score + palette tier score) / 2
+ favourite bonus + bright-colour adjustment + pattern echo adjustment**,
kept between 0 and 100.

**Colour-count score** (`COLOUR_COUNT_SCORES`) - the outfit's number of
distinct colours against the user's colour level:

| Colours | min | mid | max |
|---|---|---|---|
| 1 | 65 | 65 | 20 |
| 2 | 70 | 65 | 40 |
| 3 | 70 | 70 | 65 |
| 4 | 65 | 70 | 70 |
| 5 | - | 60 | 70 |
| 6 | - | 50 | 60 |
| 7+ | - | - | 60 |

`-` is over that level's colour cap (3.6), so it never reaches scoring.

**Palette tier score** (`PALETTE_TIER_SCORES`) - the best tier among the
level's palettes the outfit's colours fit. Minimal-colour users are pushed
to classic combinations, max-colour users to bold ones:

| Tier | min | mid | max |
|---|---|---|---|
| classic | 95 | 80 | 60 |
| common | 60 | 85 | 75 |
| bold | 30 | 65 | 90 |

**Favourite bonus** (`FAVOURITE_PALETTE_BONUS`): **+8** if the colours fit
one of the user's `favouritePalettes` - at any level, not only theirs.

**Bright-colour adjustment** (`BRIGHT_COLOUR_ADJUSTMENTS`), by how many of
the outfit's colours are in `brightColours` (Fuchsia, Lime Green, Orange,
Yellow, Turquoise, Bright Blue - in `shared/colorPalettes.json`). Bright Red isn't
one - it's treated like a classic colour. At mid, one
bright colour is best:

| Bright colours | min | mid | max |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 1 | 0 | +3 | 0 |
| 2 | −10 | −15 | 0 |
| 3+ | −30 | −15 | 0 |

Example at mid: Navy + Cream + Orange, fitting only a common palette:
(70 + 85) / 2 + 3 = 80.5. At min the same outfit is (70 + 60) / 2 − 5 = 60,
so it's dropped.

**Pattern echo adjustment** (`PATTERN_ECHO_ADJUSTMENTS`,
`computePatternEchoAdjustment`). Only for an outfit with a patterned item.
Counts the distinct colours the *other* items add that aren't already in
the patterned item - plain pieces that only echo the pattern's colours are
rewarded, new colours are penalised. Every colour counts the same (black
and white included). Strength depends on the user's `pattern` level
(missing → mid):

| New colours | min | mid | max |
|---|---|---|---|
| 0 | +6 | +4 | +2 |
| 1 | −3 | −2 | −1 |
| 2+ | −10 | −6 | −3 |

Example at min: Spotty skirt (Black, White) + a black top adds nothing new
→ +6. Spotty skirt + a red top adds Bright Red → −3.

How strict the colour check is, counting every colour combination the
palettes allow (no favourites):

| Colours | min | mid | max |
|---|---|---|---|
| 1 | 16 of 28 pass | all 28 | **none** |
| 2 | 88 of 112 | 163 of 167 | 149 of 221 |
| 3 | 111 of 134 | 273 of 283 | 494 of 568 |
| 4 | 56 of 75 | 175 of 184 | all 685 |

A one-colour outfit at max can never pass, even with the favourite bonus
((20 + 90) / 2 + 8 = 63).

**Favouriting an outfit sets its stored score to 100; unfavouriting sets
it to 85.** There's no favourite boost anywhere else - favourites are
ranked and sorted by their stored score like every other outfit. See
3.12 for star ratings, which also set the score.

### 3.11 Favourite clothing items

`server/services/favouriteItemService.js`, number in
`server/constants/scoring.js` (`FAVOURITE_ITEM_BONUS`). The heart on a
wardrobe clothing item (web and app, not footwear) sets `Clothes.favourite`
through `PUT /clothing/:id` (`core/hooks/useItemFavourite.js`).

- An **automatic** outfit with **at least one** favourite item gets **+7**
  on its stored `score` - once, however many of its items are favourites.
- It **never goes above 90** (`MAX_AUTO_SCORE`): an 86 gets +4, a 90 gets
  nothing. The amount actually added is stored in
  `Match.favouriteItemBonus`.
- **User-made** outfits stay at 95 (no bonus). Claiming an automatic outfit
  (5.3) sets it to 95 and its bonus to 0.
- **Favouriting** an item adds the bonus straight away to every automatic
  outfit with it that doesn't have one yet (`addFavouriteItemBonus`).
- **Unfavouriting** takes off exactly the stored bonus - unless another of
  the outfit's items is still a favourite (`removeFavouriteItemBonus`).
  An 88 that got +2 goes back to 88.
- **New automatic outfits** get it in `processMatches` **after** the 65
  checks and the best-100 cut (`applyFavouriteItemBonus`), never during
  the search, so a favourite can't let a weaker outfit in or change which
  100 are saved.
- The edit form never sends `favourite` (`dropFields` in
  `core/wardrobe/itemKinds.js`), so only the heart changes it.
- It's part of the stored score, so the Today ranking and My Outfits order
  use it as is - nothing is recalculated when Today is built.

---

### 3.12 Star ratings

`server/services/matchRatingService.js`, numbers in
`server/constants/scoring.js` (`RATING_SCORES`, `LOW_RATING_MAX`,
`LOW_RATED_FAVOURITE_SCORE`, `LOW_RATED_KEPT_SCORE`,
`FAVOURITE_OUTFIT_SCORE`, `UNFAVOURITED_OUTFIT_SCORE`). Route:
`PUT /match/:id/rating` with `{ rating, wearing }`. Stored in
`Match.rating` (1-5, or null).

| Stars | Outcome |
|---|---|
| 5 / 4 / 3 | score 100 / 85 / 70 |
| 1-2, ordinary outfit (worn or hand-edited too) | deleted, with its Today entries |
| 1-2, favourite (user-made or not) | kept at 70 |
| 1-2, user-made only | kept at 60 |
| 1-2, rated as it's worn on Today | kept at 60 |

- Whichever of rating and favouriting the user did last decides the
  score (favourite -> 100, rate 4 -> 85, rate 5 -> 100). Favouriting never
  changes the stars.
- Rating or favouriting sets `favouriteItemBonus` to 0, and the
  favourite-item bonus is never added to a rated or favourite outfit.
- Rated and favourite outfits are **never rejected** on Today (no swipe
  penalty), and a rated outfit is **protected** from automatic rematching
  (`matchProtection.js`). `rescoreMatches.js` skips them.
- **Today**: the stars sit under the outfit, above the buttons. Stars
  picked are saved once the user leaves the outfit (next, previous,
  another tag on web, or wearing it) - `useToday`. Opening the outfit
  screen on mobile hands the picked stars over; Save there saves them.
- **Edit page** (web card editor, mobile outfit screen): the stars are
  part of the draft and saved on Save, after the other fields.
- Existing favourites were moved to 100 once with
  `server/scripts/setFavouriteScores.js`.

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
      → no pair below 50 → colour → pattern → season → tag
  ▼
score every item-set found                   (scoreItemSet; pair blend or
                                              colour score below 65 dropped)
  ▼
best score first, until 2,000 are kept:
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
     temperature, favourite palettes;
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
   3. **Compatibility and lowest pair** (`pairsWithAll`). The candidate
      must be compatible (`isCompatible`) with **every** item already
      chosen, including the new item, and no pair with them may score
      below **`MIN_PAIR_SCORE` = 50** (3.10). One such pair rules it out.
   4. **Colour + pattern + season + tag.** The items chosen so far plus the
      candidate must still pass all four (`isStillViable`).
   5. If it passes, choose it and carry on.

These checks are **monotonic**: once a partial outfit fails one, adding more
items can never make it pass. So a failing branch is dropped immediately
instead of being built out in full. The pair blend and colour score aren't
monotonic (another item can raise either - e.g. 1 colour → 3 colours at
min goes from 65 to 85), so they're only checked once an outfit is
complete (4.5).

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

1. **Score** every item-set the moment it's complete (`scoreItemSet`,
   3.10). It's **dropped there and then** if its **pair blend** is below
   **`MIN_AUTO_SCORE` = 65**, or its **colour score** is below 65 - good
   colours can't rescue poor pairs, and good pairs can't rescue poor
   colours. A single item has no pairs or colour score and is never dropped.
   Every outfit left scores at least 65, so there's no separate check on the
   final score. Outfits the user builds have no minimum.
2. Go through them **best score first** (equal scores keep the order they
   were found in), until **`MAX_NEW_MATCHES_PER_ITEM` = 2,000** are kept.
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
3. Saved with `userMade: true` and **`score: 95`**.
4. **Learning:** `recordOutfitCreated` adds **+1** to every compatible pair
   in the outfit (Part 6).

### 5.3 Rebuilding an existing outfit

- **Already user-made** → 409 "Match already exists."
- **An automatic match** → the user **claims** it: it becomes
  `userMade: true`, its score changes to **95**, and `recordOutfitClaimed`
  adds **+1** to its pairs. Any favourite-item bonus is dropped (3.11).
  The claimed match is returned. Apart from rejecting it on the Today
  page (7.2) and favourite items (3.11), this is the only time a match's
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
| Style quiz pairing answer (2.6) | **set to** +10 / −10 / pair score 0 for that question's pairs |
| User builds an outfit (Build Matches) | **+3** |
| User claims an automatic outfit by rebuilding it | **+1** |
| User favourites an outfit | **+3** |
| User unfavourites an outfit | none |
| User marks two items as a mismatch (Today → broken heart → Mismatch, 7.3) | **−5**, to that one pair only |
| User deletes one or several outfits | none |
| User deletes a clothing item (its outfits are deleted with it) | none |
| Delete-by-piece (`deleteMatchesByPiece`, no route currently) | none |
| Marking as worn, editing a match's range | none |
| Rejecting an outfit on the Today page (7.2) | none - only that match's own score drops |
| Too hot / too cold on the Today page (7.3) | none - only that match's range moves |
| Gender changes | **all** personal adjustments deleted |
| Automatic matching creating an outfit | none |

"Every compatible pair" means every two items in the outfit that could be
matched (3.3). Incompatible pairs in a user-built outfit (e.g. two bottoms,
or two of the same subtype) are skipped and nothing is stored for them.

Favouriting is detected in `updateMatch` when `favourite` actually changes
to true. Unfavouriting doesn't take the points back, so toggling a
favourite off and on again adds another 3.

### 6.2 How adjustments are stored

- `MatchScore` stores one **adjustment** per user and subtype pair (names
  in alphabetical order), only once something has changed it.
- **Pair score = baseline + adjustment, kept between 0 and 100.**
- The adjustment itself is **limited when it's saved**, so baseline +
  adjustment can't go past 100 or below 0. A pair at 95 built ten times
  stays at 100, and the first deletion brings it straight down to 99.75 -
  no hidden reserve builds up.

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

Today's list is chosen, ordered and capped **on the server, once a day**
(`createToday` in `allControllers.js`), and every device shows it in that
order. Files: `server/services/todaySelectionService.js` (which outfits),
`server/services/todayRankingService.js` (the order), numbers in
`server/constants/todayOutfits.js`.

**Today's weather.** The client (`core/weather/openMeteo.js`, web and
mobile) takes the min and max of Open-Meteo's **15-minute** temperatures from
**07:30 to 22:30** local time (`core/constants/daytimeHours.js`) - the
overnight low isn't what anyone dresses for. It's shifted by the weather
offset (sunny / rain) and sent to `/today/create` with the season and the
user's weekday.

**Which outfits** (`selectTodayMatches`), from those marked for today's
season and not rejected recently (7.2):

1. **Tier 1** - either of these, ranked together:
   - the outfit's `min_temp` and `max_temp` are each close to today's
     daytime min and max: up to **`CLOSE_MATCH_OUTSIDE` = 1.5°** beyond
     the day's range or **`CLOSE_MATCH_INSIDE` = 2°** inside it (a 10–20°
     day takes 8.5–12° minimums and 18–22° maximums;
     `closeMatchBounds` in `server/services/temperatureService.js`);
   - the outfit's range covers **all** of today's daytime range
     (`todayCoverageFraction` = 1: `min_temp <= today's min` and
     `max_temp >= today's max`).
2. **Tiers 2–4** - one per **`PARTIAL_COVERAGE_STEPS` = 90%, 80%, 70%**:
   outfits covering at least that much of today's range.
3. Each outfit goes in the first tier it fits. A tier only joins while the
   tiers above it have fewer than **`TODAY_OUTFIT_LIMIT` = 200**, and
   always comes after them. The list is cut to **200**, best first.

Coverage is measured against the **day's** range, so a narrow outfit
inside a wide day only counts the part of the day it covers (a 14–16°
outfit on a 10–20° day covers 20%).

**The order** (`rankTodayMatches`), within each tier: outfits with today's
weekly-preference tag first, then the rest; each group by a weighted total
of factors that each run from 0 to 10. Temperature isn't part of it - the
tiers already decided that.

| Factor | Weight |
|---|---|
| Clothing freshness (average of the outfit's clothes) | 0.25 |
| Outfit freshness | 0.25 |
| **Match score** (`score` ÷ 10, or 10 for a favourite) | **0.50** |

Freshness is 10 for never worn, rising from 0 (worn today) to 10 after
`FRESHNESS_FULL_DAYS` = 30 days.

**Variety** (`server/services/todayDiversityService.js`), so outfits
sharing an item don't come up back to back:

- **Jitter** - each ranking total gets a random nudge of up to
  ±**`RANKING_JITTER` = 0.3**, so the order changes from day to day.
- **Spreading** - within each tag group of each tier, the next outfit is
  the highest-ranked one sharing **no clothing item** with the last
  **`SPREAD_LOOKBACK` = 3** outfits placed (including the end of the tier
  or group above). If every remaining outfit shares something, the one
  sharing the fewest items goes next. Tiers and tag groups still never
  mix.

**Once a day.** `/today/create` does nothing if the user's list was already
built today (and ranked), so a second device gets the same list. Each
Today entry stores its `rank`; `/today/get` returns them in rank order.

**Worn today.** `/today/get` also returns the most recently worn outfit
since the user's local midnight - from Today on any device or the Outfits
page - and the page opens on it. Marking a different one worn undoes the
first only if this device marked it (it holds the undo snapshot); one
marked elsewhere stays counted. The shoe box does the same with the
footwear's `lastWornDate`.

The page shows one outfit at a time with ‹ / › arrows (wrapping round at
either end), and the "Filter by Tag" panel beside it - it filters the 200
on show. The filter starts on today's weekly-preference tag (click it to
clear), with a "Today's <tag> outfit" subtitle under the panel title.

### 7.2 Rejecting an outfit

Files: `server/services/matchRejectionService.js`,
`core/today/outfitRejection.js`, `rejectMatch` and `createToday`
in `allControllers.js`. Numbers in `server/constants/scoring.js`.

- Pressing **›** rejects the outfit being left (`PUT /match/:id/reject`),
  including favourites and rated outfits, the last outfit when it wraps round, and while a tag
  filter is on. ‹ never rejects.
- A rejection counts **at most once per outfit per day**: `rejectedCount`
  +1 and `lastRejectedDate` = now. It **never changes a score** (the
  outfit's or any pair's) - hiding it from Today is its only effect. The client sends no
  request once the outfit's `lastRejectedDate` is today; the server ignores
  a repeat anyway.
- **`createToday`** leaves out outfits rejected in the last
  **`REJECTION_COOLDOWN_DAYS` = 3** days - one rejected on the 2nd is
  hidden up to and including the 5th. If every outfit that could get into
  today's tiers was rejected recently, none are left out. Today's list is built once a
  day, so an outfit rejected today stays reachable with ‹ until tomorrow.
- **Marking as worn** an outfit rejected today undoes the rejection
  (count −1, `lastRejectedDate` back to null). The previous
  rejection date isn't kept, which doesn't matter: anything rejected in the
  3 days before wasn't in today's list to wear. Switching the worn outfit
  to another one later doesn't re-apply the rejection.
- "Today" is the user's local day: the client sends its local midnight
  (`todayStart` / `today_start`); the server falls back to its own.

### 7.3 The broken heart (too hot, too cold, mismatch, tights)

Files: `server/services/temperatureFeedbackService.js`,
`server/services/mismatchService.js`, `server/services/mismatchRules.js`,
`server/services/tightsFeedbackService.js`,
`core/hooks/useOutfitFeedback.js` (the screen's logic, web and mobile),
`core/hooks/useMismatchPicker.js` (picking the two items),
`core/hooks/useOutfitMismatch.js` (the outfit card's broken heart),
`core/today/outfitFeedback.js`. Numbers in `server/constants/scoring.js`.

There is no delete button on the Today page. The broken heart (left of the
shoe and heart buttons, on web and mobile) opens a screen for the
outfit on show with three options - four when the card says "Wear with
tights" - and Cancel. Mismatch and tights come first, the two weather
options underneath. Each one, once saved,
closes the screen and shows the next outfit.

- **Today's weather too cold for this** / **too hot for this**
  (`PUT /match/:id/temperature-feedback`, `{ feel: "too_hot" | "too_cold" }`
  respectively - the `feel` names are the old labels): the outfit's `min_temp` and
  `max_temp` both move **`TEMPERATURE_FEEDBACK_SHIFT` = 1°** - up for
  too_hot / "weather too cold" (so it's suggested on warmer days), down
  for too_cold / "weather too hot". Its
  Today entry is marked `hidden`, so `/today/get` leaves it out for the
  rest of the day (the entry is kept so the list still counts as built).
  It isn't rejected and its score doesn't change.
  `resetMatchTemperatures.js` and `rescoreMatches.js` recalculate the
  range and undo the shift.
- **Mismatch** (`POST /match/:id/mismatch`, `{ clothesIds: [a, b] }`): the
  user picks exactly **2** of the outfit's clothing items (shoes aren't
  offered; a two-item outfit starts with both picked). Then:
  1. each item's `mismatchedWith` gets the other's id - automatic
     matching never pairs them again (3.3);
  2. every outfit containing both is deleted, with its Today entries -
     **except favourites and user-built outfits**, which are kept - the
     outfit on show too, which is then just hidden from today's list.
     Worn and hand-edited outfits are deleted: unlike automatic
     rematching (1.8), a mismatch is the user's own call. A deleted
     worn-today outfit loses its undo snapshot, as a delete did;
  3. that subtype pair's personal adjustment drops by
     **`LEARNING_DELTAS.mismatched` = −5**. The outfit's other pairs
     don't change.
  Deleting either item takes it off the other's list (`forgetMismatches`).
  There's no way to undo a mismatch yet.

  **From an outfit card.** The same mismatch is on every outfit's
  expanded card (web: `viewMatchesCard.jsx` → `outfitMismatchModal.jsx`;
  mobile: the outfit screen, `mobile/src/app/outfit.jsx` →
  `OutfitMismatch.jsx`, whether opened from Outfits or Today). A broken
  heart sits next to the favourite heart in the top corner and goes
  straight to picking the two items; Back closes it. Once saved the card
  closes (mobile: the screen goes back) and the outfit list reloads; on
  mobile, Today drops the deleted outfits too (`markOutfitsRemoved` in
  `outfitHandoff.js`). The pickers are shared: `mismatchPicker.jsx`
  (web) and `MismatchPicker.jsx` (mobile).
- **Can't wear this with tights** (`PUT /match/:id/tights-feedback`,
  `{ scope: "outfit" | "item" }`), only for an outfit on today's list
  thanks to its tights range. It asks:
  - **Just this outfit**: the match gets `noTights`;
  - **Never with this <skirt / dress / shorts>**: the item's
    `wearWithTights` becomes false and every outfit with it gets
    `tights: false`.
  Nothing is deleted and no score changes. The outfit is hidden from
  today's list - and for the item, so is every other outfit with it
  that's only there thanks to tights. Both can be turned back on: the
  outfit's edit page has a "Can wear with tights" switch, and the item
  form has the tights question. Tights rules: `temperature-ranges.md`
  Part 5.

### 7.4 My Outfits order

The match list (`GET /match/`) is paged **highest score, then newest**
(`HIGHEST_SCORE_FIRST` in `server/services/queryHelpers.js`, backed by
the `{ userId, score, _id }` index on Match). Favourites aren't put
first - favouriting sets their score to 100 (3.10). The clothing list is
still newest first.

### 7.5 Temporary score display

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
- seasons **Spring, Autumn, Winter** and tags **Work, Formal, Date night,
  Everyday** (from the subtype)

She saves. The item passes every check and is stored, and `processMatches`
starts.

**Compatibility.** Buttondown shirt + Wide leg trousers, + Trench coat and
Wide leg trousers + Trench coat are "always" role pairs. Buttondown shirt +
Light cardigan is a top+top pair the woman matrix allows. Cream, Gold,
Brown and Camel all fit inside the mid palette `cream-camel-olive-green`
(`classic`). Only one item (the shirt) is
patterned. Spring, Autumn and Winter are shared by everything, and so is
the **Everyday** tag. Outfits without the cardigan also share **Work**, so
they're tagged `Work, Everyday`. Outfits with the cardigan are tagged
`Everyday` only.

**Scores.** woman matrix:

| Pair | Score |
|---|---|
| Buttondown shirt + Wide leg trousers | 88 |
| Buttondown shirt + Trench coat | 88 |
| Buttondown shirt + Light cardigan | 45 |
| Light cardigan + Wide leg trousers | 84 |
| Light cardigan + Trench coat | 68 |
| Wide leg trousers + Trench coat | 90 |

Colour scores at mid: Cream + Gold fits a `common` palette (85) with 2
colours (65) → (65 + 85) / 2 = **75**. Cream + Gold + Camel only fits
`classic` palettes (80), 3 colours (70) → **75**.

| Shape | Items | Pair blend | Colour score | Score | Result |
|---|---|---|---|---|---|
| 4 (1 top, 1 bottom) | shirt + trousers | 88 | 75 | 0.5 × 88 + 0.5 × 75 ≈ **82** | **saved** |
| 5 (+1 outer) | shirt + trousers + trench | 0.7 × 88.7 + 0.3 × 88 ≈ 88.5 | 75 | **82** | **saved** |
| 6 (2 tops, 1 bottom) | shirt + cardigan + trousers | - | - | - | **dropped** |
| 7 (2 tops, 1 bottom, 1 outer) | shirt + cardigan + trousers + trench | - | - | - | **dropped** |

The shirt + cardigan pair scores 45, below `MIN_PAIR_SCORE` (50), so the
search drops every outfit with both of them the moment the cardigan is
picked - however good the other pairs and colours are.

Both outfits left are within the best 2,000, so both are saved, each with its score.
"View New Matches" polls until they appear.

**Learning.** On the Today page she marks the shirt and trousers in the
2-item outfit as a mismatch. Both outfits contain them, so both are
deleted, and this shirt is never matched with these trousers again.
Buttondown shirt + Wide leg trousers drops from 88 to 83, so her other
shirts and trousers of those subtypes still match, just a little lower. If she favourites the 3-item outfit, its score becomes 100
and its 3 pairs get +3. If she builds shirt + cardigan + trousers
herself, it's saved (user-made outfits have no minimum) and the shirt +
cardigan pair goes up to 48.

---

## Part 9 - Things noticed while documenting

These are behaviours found in the code that may not be intended.

1. **Item names containing a tag word fail to save.** `detectFromName`
   returns the matching **tag objects** (`{ name }`), not tag names
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
6. **Matching runs after the response is sent.** It's kept alive with
   `waitUntil`, but the client polling (8 × 1 s) can finish before a large
   run has saved its matches, so new matches may only show on a later
   load.
7. **Existing matches keep their old scores.** Scores are set once, so
   matches saved before the colour-score change (palette tiers, favourites,
   bright colours, the 65 checks) keep the score they were given, and
   outfits that would now be dropped stay saved. Only new matches use the
   new rules.

---

## Part 10 - Why it works this way

Decisions made when matching was redesigned (October 2026), so they aren't
undone by accident:

- **Compatibility and score are separate.** Previously one number per pair
  did both, so deleting a few outfits could stop a pair matching at all,
  and pairs started with very different "lives". Now compatibility is a
  fixed yes/no and the score only ranks.
- **Nothing the user does can make a pair of subtypes match or stop
  matching.** Building an outfit with an incompatible pair saves that
  outfit (user-built outfits are never checked) but doesn't teach automatic
  matching to produce it.
- **Mismatch is the one exception, and it's per item** (October 2026): it
  stops two specific clothing items matching, not their subtypes - the
  subtype pair only scores lower (−5).
- **Deleting outfits doesn't change pair scores** (October 2026). The
  −0.1 per deleted outfit hit every pair in it, most of which the user
  didn't mind; Mismatch is the targeted signal instead.
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
  automatic outfit (it becomes 95), rejecting it on the Today page
  (−3 per day it's rejected, 7.2) and favourite items (+7, 3.11).
  Re-scoring existing matches isn't ruled out - it just isn't done
  automatically when the pair adjustments change.
- **The favourite-item bonus comes after matching**, not inside the
  score used to choose outfits, so it can't push a poor combination in.
  It's stored on the match (`favouriteItemBonus`) so unfavouriting is
  exact even when the 90 cap cut it short.
- **Only the best 2,000 new outfits per item are saved**, rather than
  whichever the search happened to find first.
- **Temperature belongs to matches, not items.** Item ranges were removed;
  a match's range comes from preset groups and points
  (`temperature-ranges.md`).
- **Renames and merges:** Demin jacket → Denim jacket, Short Turtlneck →
  Short turtleneck, Long-tshirt → Long t-shirt, Wideleg trousers → Wide leg
  trousers; Beige → Cream, Lavender → Lilac; Chinos removed for women
  (existing ones become Cropped trousers).

---

## Part 11 - Database scripts

All in `server/scripts/`. Each reads `MONGO` from `server/.env`. Run from
the project root with `node server/scripts/<name>.js`.

| Script | What it does | Safe to run again? |
|---|---|---|
| `resetMatchTemperatures.js` | Recalculates every match's temperature range from the current presets (`--dry-run`, `--backup <file>`). Also overwrites ranges edited by hand | Yes - run it after changing `temperatureGroups.js` |
| `rematchAll.js` | **Deletes every match and Today entry for every user** (user-made and favourites too), then runs `processMatches` for every clothing item under the current rules. Personal score adjustments are kept. Only shows counts unless run with `--confirm` | Yes, but each run throws away user-made outfits and favourites |
| `setFavouriteScores.js` | One-off for star ratings (3.12): sets every favourite's stored score to 100 (no favourite-item bonus) and drops the old `{ userId, favourite, score, _id }` index. Only shows counts unless run with `--confirm` | Yes - already-moved favourites are left alone |

The one-off migrations for the changes in Part 10 (subtype renames, the
score-adjustment reset, colour merges, removing clothing temperatures,
adding `clothesKey`) were run on the database and then deleted. They're in
the git history if one is ever needed again. The Maroon → Burgundy colour
rename (October 2026) was also run once and deleted; it was never committed.
So was the clean-up after women's Waistcoat × Vest / Light jumper were set
to null (October 2026): it deleted every match containing a pair the
user's matrix no longer allows (`isCompatible`), plus their Today entries.

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
| Outfit score blend, lowest pair score, colour-count / palette tier / bright-colour / pattern echo scores, favourite bonus, single-item / user-made scores, learning steps | `server/constants/scoring.js` |
| Allowed outfit shapes | `server/constants/outfitShapes.js` |
| Colour palettes, their tiers and levels, colour caps, bright colours | `shared/colorPalettes.json` (loaded by `server/utils/colorPalettes.js` and `core/utils/colourPalettes.js`) |
| Favourite palette picker | `PalettePicker.jsx` (web: `src/components/preferences/`, app: `mobile/src/components/styleQuiz/`) |
| Patterned-item limit | `passesPatternCheck` in `server/services/styleColorService.js` |
| Search limits and best-N | `MAX_POOL_SIZE_PER_ROLE`, `MAX_COMBINATIONS_EXPLORED`, `SEARCH_TIME_LIMIT_MS`, `MAX_NEW_MATCHES_PER_ITEM` in `matchService.js` |
| Lowest pair blend / colour score an automatic outfit is saved at, lowest single pair | `MIN_AUTO_SCORE` / `MIN_PAIR_SCORE` in `server/constants/scoring.js` |
| Time kept for saving / save chunk size | `SAVE_RESERVE_MS`, `INSERT_CHUNK_SIZE`, `INSERT_STOP_MARGIN_MS` in `matchService.js` |
| Default gender when missing | `DEFAULT_GENDER` in `matchScoreService.js` |
| Style quiz pairing questions / their pairs / answer values | `src/constants/pairingQuestions.js` / `server/constants/pairingQuestions.js` / `PAIRING_ANSWER_ADJUSTMENTS` in `server/constants/scoring.js` (see 2.6) |
| Today page weights, tiers and cap | `server/constants/todayOutfits.js` |
| Favourite clothing item bonus | `FAVOURITE_ITEM_BONUS` in `server/constants/scoring.js`, logic in `server/services/favouriteItemService.js` (3.11) |
| Days a rejected outfit is hidden | `REJECTION_COOLDOWN_DAYS` in `server/constants/scoring.js` |
| Too hot / too cold shift, mismatch penalty | `TEMPERATURE_FEEDBACK_SHIFT`, `LEARNING_DELTAS.mismatched` in `server/constants/scoring.js` (7.3) |
| Favourite score | `FAVOURITE_SCORE` in `src/utils/matchScore.js` |
| Temperature numbers | `server/constants/temperatureGroups.js`, see `temperature-ranges.md` |
| Remove the temporary score display | see 7.5 |
| One-off database updates | `server/scripts/`, see Part 11 |

Tests: `server/specs/` (`matchService`, `matrixService`,
`outfitScoreService`, `outfitEvaluator`, `styleColorService`,
`matchScoreService`, `matchScoreBaseline`, `pairingQuizService`, `matchRejectionService`, `favouriteItemService`,
`mismatchRules`, `temperatureFeedbackService`,
`matchRefreshService`, `matchProtection`,
`presetTemperatureService`,
`temperatureService`,
`colorPalettes`). Run them with `cd server && node --test specs/*.spec.js`.
