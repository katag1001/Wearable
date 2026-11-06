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
  tags) and the **subtype** (tags). Items have no temperature and no
  seasons - only a `fabric` (3.8); matches have both.
- **Style** (`Plain` / `Patterned`) is never chosen by the user. It is
  `Patterned` whenever the item has more than one colour.
- There is **no manual or admin approval**. An item is accepted once it
  passes the form's checks and the server's checks (auth, type, duplicate,
  schema).
- Once an item is saved, the server **searches for every possible outfit**
  that includes it from the rest of the wardrobe, in the background. An
  outfit is a candidate only if it passes all of these: fixed compatibility,
  layering rules, colour palette, pattern limit and a shared tag
  (seasons never reject an outfit, 3.8).
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
| `src/components/clothes/uploadComponents/typePicker.jsx` | The subtype picker (page one and the photo review) |
| `src/components/clothes/uploadComponents/modalTwo.jsx` | Page two: fabric, colours, pattern, tags - each field also exported on its own |
| `src/components/clothes/uploadComponents/useClothingForm.jsx` | Form state and toggle handlers |
| `src/components/clothes/uploadComponents/useClothingDetection.jsx` | Auto-fills page two when Next is clicked |
| `src/components/clothes/uploadComponents/uploadHelpers.jsx` | Name detection, subtype suggestions, defaults |
| `core/constants/typeOptions.js` | Subtypes per gender, with their category and default tags |
| `core/constants/optionsBank.js` | Colour, fabric, pattern, tag and season option lists |

**Adding from a photo** (the usual way in): the user picks a photo, sees a
loading screen while the server removes its background and analyses it
(`core/hooks/usePhotoAnalysis.js`, `server/controllers/analysisControllers.js`).
The background comes off first, so Gemini sees the cleaned-up photo:
`server/services/backgroundRemovalService.js` (numbers in
`server/constants/backgroundRemoval.js`) saves it as `<id>_nobg` with a
`<id>_thumb` thumbnail, the same recipe as the existing photos. If
Cloudinary can't remove it within 45 seconds, the photo is analysed and
saved as uploaded. The app then shows and saves the background-removed
photo; on save the server fills in the thumbnail and original from its id
(`withDerivedImageFields`, `services/imageService.js`), and if the item is
never saved every image made for it is deleted. Manual adding (no
analysis) doesn't remove backgrounds. Then the photo with what was found: name, type and colours as rows, each
with a small greyed-out "Change" that opens that field's picker under it,
and "Show more fields" for pattern, fabric, tights and tags. Save is at the
bottom; saving shows "View new matches" / "Add another item" (with
confetti on mobile). The rows are `core/hooks/useAnalysedItemReview.js`;
the editing and saving are this same form (`useWardrobeItemForm`, filled
in from the analysis and never re-filled from the name and type), drawn by
`src/components/clothes/analysedItemReview.jsx` and
`mobile/src/components/wardrobe/AnalysedItemReview.jsx`. The type picker
can also switch the item between clothing and footwear. If the analysis
fails, the full form below opens with the photo attached.

**AI consent** (2026-11-05): before a user's first add from a photo, they
must answer whether AI may analyse their photos - no way past it
(`core/hooks/useAiConsent.js`, drawn by `src/components/clothes/aiConsentPrompt.jsx`
and `mobile/src/components/wardrobe/AiConsentPrompt.jsx`; wording in
`core/constants/aiAnalysis.js`). The answer is `Preferences.aiAnalysis`
(null = not asked yet), changeable in Settings (web User sidebar, mobile
Profile -> Settings; `core/hooks/useAiSettings.js`). Opted out, the app
calls `POST /items/remove-background` instead: the background is still
removed, nothing goes to Gemini, and the full form opens with the photo
attached (`usePhotoAnalysis` step "manual"). `/items/analyse` refuses
(`ai_opted_out` / `consent_required`) unless `aiAnalysis` is true. Both
routes share the daily photo limit (`shared/photoLimits.json`).

### 1.1 When the form opens

`addUpdateClothes` fetches `/preferences` once and reads:

- `gender` decides which subtype list is shown
  (`getTypeOptions(gender)`). It is `unisex` until it loads, and stays
  `unisex` if the user has no preferences or an unknown gender.

The form starts from `getInitialState()` (`uploadHelpers.jsx`): empty name,
no colours, `styles: "plain"`, `fabric: ""` and no tags.

### 1.2 Page one: name, image, subtype

**Name.** Free text and required. It drives the subtype suggestions and,
later, colour/tag detection.

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

Tags are cleared first, then rebuilt from the sources below.

| Field | Comes from | Rule |
|---|---|---|
| `colors` | Name only | Every colour in `colorOptions` whose name appears anywhere in the lowercased item name. **Only replaced if the name changed.** If only the subtype changed, the user's colour picks are kept. |
| `styles` | Colours | `Patterned` if there are 2 or more colours, otherwise `Plain`. Recalculated every time the colours change (1.4). |
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
  `Cream`, `"lavender"` → `Lilac`, `"cobalt"`, `"royal blue"`,
  `"electric blue"` → `Bright Blue`, `"red"` → `Bright Red`,
  `"deep red"` → `Dark Red`, `"pink"`, `"light pink"`, `"pale pink"` →
  `Baby Pink`, `"hot pink"` → `Bright Pink`, `"yellow"` → `Bright Yellow`,
  and `"butter"`, `"pale yellow"` → `Butter Yellow`. Beige and Lavender were
  merged into those colours, and Red, Pink, Yellow and Deep Red were
  renamed, so they can't be picked any more. An alias inside a colour or a
  longer alias already found doesn't count, so `"Dark red dress"` is only
  `Dark Red` and `"Hot pink top"` is only `Bright Pink`.
- There is no plain "Red", "Pink" or "Yellow" either: `Bright Red`,
  `Dark Red` and `Burgundy`; `Baby Pink` and `Bright Pink` (plus `Fuchsia`);
  `Bright Yellow` and `Butter Yellow`.
- There is no plain "Blue". Only `Bright Blue`, `Dark Blue`,
  `Light Blue`, `Navy`, `Teal` and `Turquoise` exist, so `"Blue jeans"`
  detects no colour. The
  user has to pick one, because page two needs at least one colour.

The user can correct all of this on page two.

### 1.4 Page two: the user reviews

`modalTwo.jsx` shows everything filled in above, and the user can change any
of it:

- **Fabric.** One of `shared/fabrics.json`, or "Not sure" (`setFabric`, clothing only).
- **Colours.** A grid of the 33 `colorOptions`, grouped by colour rather than alphabetical (`toggleColor`).
- **Tags.** The 10 `tagOptions`: Work, Gym, Loungewear, Party, Date night,
  Formal, Beach, Outdoor, Dinner, Everyday.

There is no temperature on the form - items don't have one.

**Style is recalculated automatically.** An effect in `addUpdateClothes.jsx`
sets `styles` to `"Patterned"` when there are more than one colour and to
`"Plain"` otherwise, every time the colours change. (`toggleColor` also sets
a lowercase `"patterned"`, but the effect overwrites it straight away, so
the value saved is always `"Plain"` or `"Patterned"`.) There is no control
for style on the form.

**Validation for page two:** at least one colour. Fabric and tags are optional.

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
| 2 | Page two (client) | ≥1 colour | Message, can't save |
| 3 | `authMiddleware` | Valid `Bearer` JWT; sets `req.user.userId` | 401 |
| 4 | `createItem` | `type` present | 400 "Missing type" |
| 5 | `createItem` | No existing item with the same `name` + `type` for this user | Returns the existing item (see Part 9) |
| 6 | Mongoose `Clothes` schema | `name`, `userId`, `colors`, `type`, `subtype` are required; `fabric` must be "" or one of `shared/fabrics.json`. Fields must cast (for example `tags` must be strings) | 500 with the validation message |

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
  doesn't reset its tags. A subtype change still
  updates `type`.
- Style is still recalculated from the colours (1.4).
- If no field matching reads changed (`type`, `subtype`, `colors`,
  `fabric`, `tags`, `pattern`, `wearWithTights`) - e.g. only the
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
  - **Rematch** - a change to `type`, `subtype`, `colors`, `tags` or
    `pattern` (`REMATCH_ITEM_FIELDS`): every unprotected outfit
    with the item is deleted, valid or not, so the search below builds
    them all again with new scores.
  - **Re-check** - any other change (the tights answer, the fabric): each
    outfit is re-checked against the search's rules (shape, compatibility,
    layering, colour, pattern, shared tag), and the unprotected ones
    that no longer pass are deleted.
  - Deleting lowers no pair scores and takes the outfit's Today entries
    with it.
  - Every kept outfit has only the fields fed by the changed item fields
    rewritten (`ITEM_FIELD_TO_OUTFIT_FIELDS`: fabric → the season flags,
    colours → colours and season flags, tags → tags, subtype → temperature
    range and season flags, type → temperature range, role counts and
    season flags). Manual edits to the
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

The quiz has five steps, plus pairing questions for women and unisex.
Every step has Back / Next (the first has only Next, centred), and Log out
sits at the bottom of every page. Favourite palettes aren't asked -
they're set on Style Preferences (2.3):

1. **"How do you prefer to dress?"**: More feminine → `woman`, More unisex →
   `unisex`, More masculine → `man`. Saved as `gender`. Changing it
   drops any style images already picked.
2. **"Do you generally feel too cold or too hot?"**: a 1-5 scale, "I'm
   always too cold" to "I'm always too hot", "Neutral" in the middle
   (starts at 3). Saved as `temperature`; it shifts outfit temperature
   ranges by +1 … −1 (temperature-ranges.md 1.5).
3. **"Select all that apply"**: a grid of style images. Only images whose
   `gender` list includes the chosen gender are shown. At least one image
   must be picked. For `woman` and `unisex` a **smart-and-casual** tile
   sits at the end - a pairing answer (2.6), never counted for colour or
   pattern.
   - **"Do you like to layer tops?"** (`woman` and `unisex` only,
     `LayeringStep.jsx` / mobile `PairingStep.jsx`): six pictures, tick
     any that apply, with Skip under the question. See 2.6.
4. **"Do you have a regular schedule to dress for?"** (mobile
   `WeeklyStep.jsx` / `WeekTagList.jsx`, web `WeeklyTagStep.jsx`): the
   days down the side, each with a tag box that opens every tag; a "Set
   weekdays the same" switch copies Monday to Tuesday-Friday
   (`useSameWeekdays`). Every day is optional, and only the days picked
   are saved, so retaking the quiz never clears a day set on the Weekly
   Preferences page (which uses the same list on mobile). Skip saves no
   days. Saved as `monday` … `sunday`.
5. **"How much does the season affect what you wear?"**: a 1-5 scale.
   Saved as `seasonality`. Finish saves the whole quiz.

### 2.2 How the images become colour and pattern

Each image in `styleImageOptions` carries a colour and a pattern level.
Each image is `women1`–`women11` or `men1`–`men10`
(`core/assets/styles`). Colour rows × pattern columns:

| woman (11) | pattern min | pattern mid | pattern max |
|---|---|---|---|
| colour min | women1, women2, women11 | women3, women4 | - |
| colour mid | women5 | women6, women7 | women8 |
| colour max | women9 | - | women10 |

| man (10) | pattern min | pattern mid | pattern max |
|---|---|---|---|
| colour min | men1, men2 | men3 | - |
| colour mid | men4, men10 | men5 | men6 |
| colour max | men7 | men8 | men9 |

**unisex** sees 13: six from each set picked so colour and pattern were
4 / 4 / 4, plus women11 (min/min) - women1, women3, women5, women6, women8,
women10, women11, men1, men3, men6, men7, men8, men9.

`resolveStyleQuiz(selectedKeys)` takes a **majority vote** across the
selected images, separately for each label:

- **colour.** The most common `colour`. Ties go to the first in
  `levelPriority = ["min", "mid", "max"]`, so ties lean towards fewer
  colours.
- **pattern.** Same as colour.

Example: a woman picks women10, women3 and women8.

- colour: max 1, min 1, mid 1 → tie → **min**
- pattern: max 2, mid 1 → **max**

`PUT /preferences` is sent with `{ gender, colour, pattern, seasonality,
temperature }`, plus `pairingAnswers` and any weekly days picked.

### 2.3 Changing preferences later

`stylePreferences.jsx` (on the user page) lets the user change gender and
temperature, and optionally re-pick images. Colour and pattern are only
re-calculated and sent **if at least one image is selected**. Otherwise
they stay as they were. Like the quiz, it only shows the images for the
gender currently chosen on the page (`styleImagesFor`).

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
- temperature missing → treated as 3 (neutral, no shift)

`getBaselineMatrix(gender)` falls back to the **unisex** matrix for an
unknown gender.

### 2.6 Pairing questions

Files: `core/constants/pairingQuestions.js` (labels, images),
`server/constants/pairingQuestions.js` (which pairs each question sets),
`server/services/pairingQuizService.js`. The keys must match.

Each question is a list of pair groups, and each group says how many
points **yes** and **no** add to its pairs' baseline (limited to 0-100).
**Sometimes** changes nothing. OFF takes the pair to 0.

| Key | Picture | Pairs | Yes | No |
|---|---|---|---|---|
| `shirtsOverTops` | shirt-over-top | Buttondown, Denim, Linen shirt × Vest, Croptop | +10 | −10 |
| | | Buttondown, Denim, Linen shirt × Short t-shirt | +5 | −5 |
| `turtlenecksUnderShirts` | t-under-shirt | Short/Long turtleneck × Buttondown, Denim, Linen shirt, Floaty, Peasant/boho, Fancy blouse | +10 | −10 |
| `topsUnderDresses` | t-under-dress | Short/Long turtleneck, Long-sleeve t-shirt × Winter, Work, Casual dress | +10 | −10 |
| | | Short t-shirt × Winter, Work, Casual dress | +5 | −5 |
| `shirtsUnderDresses` | shirt-under-dress | Buttondown, Denim, Linen shirt × Work dress | +10 | −10 |
| `linenWithSummerDresses` | shirt-summerdress | Linen shirt × Summer dress, Strappy summer dress | +10 | −10 |
| `tshirtsOverLongSleeves` | t-under-t | Short t-shirt × Long-sleeve t-shirt (baseline 50: yes → 70, no → 40) | +20 | −10 |
| `smartAndCasual` | smart-casual (style images) | Hoodie × Blazer, Trench coat, the skirts; Blazer, Trench coat × Sweatpants, Leggings; Cargo pants × Fancy top, Fancy blouse, Blazer | +10 | OFF |

Pairs the matrix doesn't allow (`null`) are skipped, so an answer never
changes compatibility - e.g. Denim shirt × Croptop.

The quiz turns the pictures into yes / no answers (`buildPairingAnswers`
in `core/styleQuiz/quizAnswers.js`):

- **Layering** ("Do you like to layer tops? Tick any that apply.", six
  pictures). Next sends all six: ticked → `yes`, not ticked → `no`.
  Skip sends none of them, so those pairs keep their baseline.
- **Smart and casual.** Picked → `yes`. Not picked → nothing sent.

Style Preferences asks all seven as Yes / Sometimes / No ("Do you
like...").

The quiz sends the answers with `PUT /preferences` as `pairingAnswers`.
They aren't stored on preferences. Instead every pair in an answered
question has its personal adjustment **set** (not added to what's there)
to the answer's points. Retaking the quiz overwrites those pairs again. If
two answered questions share a pair, the lower adjustment wins.

Anything that ends below `MIN_PAIR_SCORE` (50) is dropped by the search
(4.4) and never suggested automatically. It can still be built by hand,
and building or favouriting it lifts the pair again. The answers are
applied after a gender-change wipe, so they survive a gender change made
in the same save; a later gender change deletes them with every other
adjustment. Men are never asked, and the server ignores answers for them.

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
| min | 53 | 4 |
| mid | 104 | 6 |
| max | 122 | no cap |

An outfit passes if **all of its colours together fit inside at least one
of its level's palettes**, and the number of distinct colours is within
the cap. This is pass/fail; the tiers only rank outfits that pass.

A palette can be bigger than its level's cap. The cap limits how many of
its colours one outfit uses, not the size of the palette.

The levels only grow: every `min` palette fits inside some `mid` palette,
and every `mid` palette fits inside some `max` palette. No palette has
all its colours inside another palette that's used at all of its levels,
whatever the tiers - one like that is deleted. The classic combinations
(Burgundy + Cream/Tan + Grey, Burgundy + Black + Grey,
Black + Bright Red + White + Grey, Brown + Tan + Olive Green + Cream)
are `classic` palettes at every level, and the colour palettes were
reviewed in October 2026 so the neutrals (Black, Grey, Navy, Cream,
Camel, Tan, Brown, Light Blue) pair with most colours. Several palettes
come as near-twins that differ by one or two colours, e.g. the Dark Red
and Burgundy versions of the autumn palettes.

Navy and Dark Blue look different (Navy is a blue-black). Dark Red and
Burgundy are two separate dark reds, each with its own palettes. Burgundy
covers every brown- or purple-leaning dark red (wine, plum, maroon,
oxblood) - Maroon was merged into it in November 2026.

Bright Blue has its own palettes: with White, Navy and Light Blue, and
with Grey and Black, at every level; with Turquoise/Teal at mid and max;
and bold contrasts (Orange, Bright Yellow, Bright Red, Fuchsia) at max
only.

Bright Yellow and Bright Pink are bright colours; Butter Yellow and Baby
Pink are soft ones that pair almost like neutrals (Navy, Grey, Camel,
Light Blue, Lilac).

Copper (a warm metallic, not a bright colour) has its own palettes too:
with Cream/Brown/Camel (classic), Olive Green/Cream/Tan and
Black/Burgundy/Cream at every level; with Navy/Cream/White (classic),
Peach/Baby Pink/Cream and Teal/Cream/Brown (bold) at mid and max; and Forest Green/Burgundy/Gold and
Turquoise/White/Navy (bold) at max only.

The server refuses to start if a palette has a duplicate id, an unknown
tier or level, or no colours (`checkPalettes`). The tests also check every
colour is in `colorOptions` and the levels only grow.

Colours don't need to be close to each other. They just need to appear
together in some palette. For example, Bright Red + Orange isn't allowed at `min`,
but is allowed at `mid` and `max`. Black + Purple is allowed from `mid`.
Black + Navy isn't allowed at any level.

### 3.7 The pattern rule

`passesPatternCheck`: **at most one patterned item per outfit.** "Patterned"
means the item has 2 or more colours (1.4). This is the same for every user.
The `pattern` preference doesn't change it - it only sets the strength of
the pattern echo adjustment in the colour score (3.10).

### 3.8 Season and tag rules

**Seasons never reject an outfit** (since November 2026). Items have no
seasons of their own - clothing has a `fabric` (`shared/fabrics.json`,
"" until known), and fabrics and colour palettes (`shared/colorPalettes.json`
`seasons`) belong to seasons, or none (any time). The saved outfit's four
season flags are worked out in `describeOutfit` by `outfitSeasonFlags`
(`server/services/seasonalityService.js`, numbers in
`server/constants/seasonality.js`). An outfit is in a season unless:

- an item's fabric belongs only to other seasons (linen isn't autumn or
  winter; velvet isn't spring or summer), or a season-named type does
  ("Winter dress", "Winter mini skirt", "Strappy summer dress", "Summer
  dress" - `SEASON_NAMED_SUBTYPES`, flags only);
- its colours only fit palettes of other seasons (a neutral palette, or
  none, never rules a season out);
- its temperature range misses the season's band
  (`SEASON_TEMPERATURE_BANDS`: winter 12° or below, spring and autumn
  8–20°, summer 18° or above).

The flags are only for the Outfits page season buttons and filter. They're
refreshed when an item's fabric, colours, type or subtype changes
(`matchRefreshService.js`). Today uses the season differently - points,
not a filter (7.1).

All items must share **at least one** tag (`hasSharedTag` in
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
Bright Yellow, Turquoise, Bright Blue, Bright Pink - in
`shared/colorPalettes.json`). Bright Red isn't
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

The heart on a wardrobe clothing item (web and app, not footwear) sets
`Clothes.favourite` through `PUT /clothing/:id`
(`core/hooks/useItemFavourite.js`). The edit form never sends `favourite`
(`dropFields` in `core/wardrobe/itemKinds.js`), so only the heart changes
it.

Since November 2026 a favourite **never changes a saved score**. An outfit
with at least one favourite item gets **+7** only while Today's list is
chosen (`FAVOURITE_ITEM_BONUS` in `server/constants/todayOutfits.js`,
`server/services/todayScoreService.js`) - see 7.1. Favourite palettes
work the same way (+4 on Today, `FAVOURITE_PALETTE_BONUS`), and are no
longer part of the colour score.

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
- Rated and favourite outfits are **never rejected** on Today (no swipe
  penalty), and a rated outfit is **protected** from automatic rematching
  (`matchProtection.js`).
- **Today**: the stars sit under the outfit, above the buttons. Stars
  picked are saved once the user leaves the outfit (next, previous,
  another tag on web, or wearing it) - `useToday`. Opening the outfit
  screen on mobile hands the picked stars over; Save there saves them.
- **Edit page** (web card editor, mobile outfit screen): the stars are
  part of the draft and saved on Save, after the other fields.
- Existing favourites were moved to 100 once with a one-off script
  (since deleted).

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
      → no pair below 50 → pattern → tag → colour
  ▼
score every item-set found                   (scoreItemSet; pair blend or
                                              colour score below 65 dropped)
  ▼
best score first, until 2,000 are kept:
  skip if already saved
  describeOutfit   → temperature (from subtypes) + season flags + tag + descriptive fields
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
3. **Check the new item on its own.** If it fails colour/pattern/tag
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
   4. **Pattern + tag + colour.** The items chosen so far plus the
      candidate must still pass all three (`isStillViable`).
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
        | `spring`…`winter` | the season flags (3.8) |
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
   - Its season flags are worked out like any other (3.8); they never
     keep it off the Today page.
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
`server/services/todayScoreService.js` (Today's points),
`server/services/todayRankingService.js` (the order), numbers in
`server/constants/todayOutfits.js` and `server/constants/seasonality.js`.

**Today's weather.** The client (`core/weather/openMeteo.js`, web and
mobile) takes the min and max of Open-Meteo's **15-minute** temperatures from
**07:30 to 22:30** local time (`core/constants/daytimeHours.js`) - the
overnight low isn't what anyone dresses for. It's shifted by the weather
offset (sunny / rain) and sent to `/today/create` with the season (from
the date and latitude, `getSeason`) and the user's weekday.

**1. Who's in the running** - the weather alone, every outfit the user has
(no season filter):

1. **Tier 1** - either of these:
   - the outfit's `min_temp` and `max_temp` are each close to today's
     daytime min and max: up to **`CLOSE_MATCH_OUTSIDE` = 1.5°** beyond
     the day's range or **`CLOSE_MATCH_INSIDE` = 2°** inside it (a 10–20°
     day takes 8.5–12° minimums and 18–22° maximums;
     `closeMatchBounds` in `server/services/temperatureService.js`);
   - the outfit's range covers **all** of today's daytime range.
2. **Then one tier per `COVERAGE_STEPS` = 95%, 90%, 85% … 50%**: outfits
   covering at least that much of today's range.
3. Whole tiers join, best first, until at least **`TODAY_OUTFIT_LIMIT` =
   150** are in the running - a tier always joins whole, so the running
   can be far more than 150.

Coverage is measured against the **day's** range, so a narrow outfit
inside a wide day only counts the part of the day it covers (a 14–16°
outfit on a 10–20° day covers 20%).

**2. The notice** (`shared/todayMessages.json`, picked by
`core/today/weatherNotice.js`; saved on `Preferences.todayNotice`): **few**
once the **70%** step had to join; **shopping** when even 50% leaves fewer
than 150 (also with nothing at all). The message suits the weather band -
cold below 10°, hot above 20° (the average of today's min and max).

**3. Today's score** (`todayScoreOf`) - the saved score plus points that
are never saved:

| Points | When |
|---|---|
| **+ seasonality** | Any item's fabric belongs to today's season (once per outfit) |
| **− seasonality** | Any item's fabric belongs only to other seasons (linen + velvet in summer = 0) |
| **+ seasonality** | Its colours fit a palette of today's season (no minus) |
| **+7** | Any item is a favourite |
| **+4** | Its colours fit a favourite palette |

"Seasonality" is the user's answer to *How much does the season affect
what you wear?* (`Preferences.seasonality`, 1–5, style quiz and Style
Preferences): 1 = 0, 2 = 2, 3 = 4, 4 = 6, 5 = 8 points
(`SEASONALITY_POINTS`; unanswered counts as 3).

**4. The order** (`rankTodayGroups`) of everything in the running,
**whatever its weather tier**: **every** outfit with today's
weekly-preference tag, then every outfit without it - each group sorted
on its own by a weighted total of factors that each run from 0 to 10.
The best **150** are kept, tagged ones first, **before** any random nudge.

| Factor | Weight |
|---|---|
| Clothing freshness (average of the outfit's clothes) | 0.1 |
| Outfit freshness | 0.2 |
| **Today's score** ÷ 10 | **0.7** |

Freshness is 10 for never worn, rising from 0 (worn today) to 10 after
`FRESHNESS_FULL_DAYS` = 30 days.

**Variety** (`server/services/todayDiversityService.js`), only on the 150
kept and within each tag group - it never changes which outfits are kept,
or lifts an untagged one above a tagged one:

- **Jitter** - each ranking total gets a random nudge of up to
  ±**`RANKING_JITTER` = 0.3**, so the order changes from day to day.
- **Spreading** - within each tag group, the next outfit is the
  highest-ranked one sharing **no clothing item** with the last
  **`SPREAD_LOOKBACK` = 3** outfits placed. If every remaining outfit
  shares something, the one sharing the fewest items goes next.

Recently rejected outfits are then moved out of the top 10 (7.2).

**Once a day.** `/today/create` does nothing if the user's list was already
built today (and ranked), so a second device gets the same list. Each
Today entry stores its `rank`; `/today/get` returns them in rank order,
with today's notice.

**Worn today.** `/today/get` also returns the most recently worn outfit
since the user's local midnight - from Today on any device or the Outfits
page - and the page opens on it. Marking a different one worn undoes the
first only if this device marked it (it holds the undo snapshot); one
marked elsewhere stays counted. The shoe box does the same with the
footwear's `lastWornDate`.

The page shows one outfit at a time with ‹ / › arrows (wrapping round at
either end), and the "Filter by Tag" panel beside it - it filters the 150
on show. The filter starts on today's weekly-preference tag (click it to
clear), with a "Today's <tag> outfit" subtitle under the panel title.

**Another tag for today (mobile).** Tapping "<tag> outfit" in the Today
header slides up `TagPicker` - every tag on any of the user's outfits
(`/match/options`). Picking one is for today only (the weekly preferences
don't change); `POST /today/tag` (`changeTodayTag`,
`server/services/todayTagService.js`):

- **At least `TAG_SWITCH_MIN_OUTFITS` = 10** of the outfits on show have
  the tag: the same list is re-ordered as if built for that tag
  (`rankForToday` - tagged first, ranking, jitter, spreading - then
  `keepRejectedOutOfTop`). Nothing joins or leaves.
- **Fewer**: today's list is built again (`buildToday` with the tag and
  `rebuild`), from the weather the app sends. Outfits hidden today stay
  hidden.

The app then fetches `/today/get` and shows only that tag's outfits, with
no wrapping round: past the last is "No more <tag> outfits that fit
today's weather", and with none at all "No <tag> outfits that fit today's
weather" stands in for them. The picked tag is cached for the day on that
device (`todayCache.js`) and is the one the header, "Not appropriate for
[tag]" and the shoe ranking use; other devices keep the weekly tag in
their header but get the new order.

### 7.2 Rejecting an outfit

Files: `server/services/matchRejectionService.js`,
`core/today/outfitRejection.js`, `rejectMatch` and `createToday`
in `allControllers.js`. Numbers in `server/constants/scoring.js`.

- Pressing **›** rejects the outfit being left (`PUT /match/:id/reject`),
  including favourites and rated outfits, the last outfit when it wraps round, and while a tag
  filter is on. ‹ never rejects.
- A rejection counts **at most once per outfit per day**: `rejectedCount`
  +1 and `lastRejectedDate` = now. It **never changes a score** (the
  outfit's or any pair's) - pushing it down Today's list is its only effect. The client sends no
  request once the outfit's `lastRejectedDate` is today; the server ignores
  a repeat anyway.
- **`createToday`** ranks today's list as usual, then
  (`keepRejectedOutOfTop`) moves outfits rejected in the last
  **`REJECTION_COOLDOWN_DAYS` = 3** days out of the top
  **`REJECTED_OUTFIT_TOP_GAP` = 10** places - one rejected on the 2nd is
  held back up to and including the 5th. They aren't left out: each one
  drops to just below the top 10 (in its ranked order), and everything else
  keeps its order. If fewer than 10 outfits weren't rejected recently, the
  rejected ones come straight after those. Today's list is built once a
  day, so an outfit rejected today stays where it is until tomorrow.
- **Marking as worn** an outfit rejected today undoes the rejection
  (count −1, `lastRejectedDate` back to null). The previous
  rejection date isn't kept, which matters little: having just been worn,
  the outfit ranks low on freshness anyway. Switching the worn outfit
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
  The shift counts as an edit by hand, so `rematchAll.js` keeps it.
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

*Written before seasons moved to fabrics (November 2026): items no longer
have seasons, and seasons don't decide whether an outfit is made (3.8).
The rest of the example still holds.*

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
- **Favourites only count on Today** (since November 2026) - items +7,
  palettes +4, never saved - so they can't push a poor combination in, and
  favouriting or unfavouriting needs no rescoring.
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
These are the only two kept scripts. A script written for one change is
run once and then deleted.

| Script | What it does | Safe to run again? |
|---|---|---|
| `rematchAll.js` | Deletes every match the user hasn't interacted with (and the Today entries pointing at them), then runs `processMatches` for every clothing item under the current rules. Every outfit the app protects is kept (`matchProtection.js`: favourites, user-made, rated, worn, edited by hand), and so are personal score adjustments. `--subtype "<name>"` limits it to outfits with that subtype. Only shows counts unless run with `--confirm`. Rebuilt outfits get new scores and temperature ranges, so run it after changing palettes, scoring, matching rules or `temperatureGroups.js` | Yes |
| `resetToday.js` | Clears every user's Today list so the app builds it again on the next load. Matches, wear history and scores are untouched. Only shows counts unless run with `--confirm` | Yes |

The one-off migrations for the changes in Part 10 (subtype renames, the
score-adjustment reset, colour merges, removing clothing temperatures,
adding `clothesKey`) were run on the database and then deleted. They're in
the git history if one is ever needed again. The Maroon → Burgundy colour
rename (October 2026) was also run once and deleted; it was never committed.
So was the clean-up after women's Waistcoat × Vest / Light jumper were set
to null (October 2026): it deleted every match containing a pair the
user's matrix no longer allows (`isCompatible`), plus their Today entries.
The colour split (26 October 2026) renamed stored colours (Yellow → Bright
Yellow, Pink → Baby Pink, Deep Red → Dark Red) and removed deleted palette
ids from favourites with a one-off script, also deleted. Maroon came back
as its own colour then; items renamed to Burgundy earlier stay Burgundy
unless changed by hand. Also deleted the same day: the scripts that reset
temperature ranges, rescored matches, removed layering violations and moved
favourites to a score of 100.

On 2 November 2026 a one-off script (also deleted, never committed)
re-filled the test account's 122 items from the Gemini photo analysis
(`server/services/itemAnalysisService.js`): every field except the photo
was replaced with the analysis as-is (no corrections), wear history,
favourites and mismatches were reset, and all matches, Today entries,
MatchScore and FootwearScore documents and favourite palettes were deleted
before `rematchAll.js --confirm` rebuilt the outfits.

Also on 2 November 2026, a one-off script (deleted, never committed)
removed the background from all 122 item photos with Cloudinary
(`e_background_removal`, then `e_trim`, at most 1200px): each result
was saved as its own transparent WebP and shown as the item's image, with a
300px WebP thumbnail (`thumbnailUrl` / `thumbnailCloudinaryId`) and the
photo as uploaded kept in `originalImageUrl` / `originalCloudinaryId`.
`services/imageService.js` deletes all three images together.

Also on 2 November 2026, a one-off script (deleted, never committed) moved
the database to fabric-based seasons: every clothing item got `fabric: ""`
(the photo analysis fills it in) and clothes and footwear lost their
spring/summer/autumn/winter fields; outfits lost `favouriteItemBonus` and
had their season flags worked out again (3.8); the test user's
`seasonality` was set to 5. Saved scores still need a full rematch once
the items have fabrics.

Still on 2 November 2026, a one-off script (deleted, never committed)
re-analysed all 122 items with prompt v3 (fabric instead of seasons, full
definitions in `server/constants/analysisDefinitions.js`, stricter tags,
a piece description before the type, the fixed prompt before the photo)
and wrote the answers onto the items as-is, keeping their images,
favourites and wear history. Every match and Today entry was then deleted
and `rematchAll.js --confirm` rebuilt the outfits.

Still on 2 November 2026, after the user corrected the items by hand
(saved as the gold standard in `server/scripts/reports/gold-standard-items.json`,
git-ignored), Maroon was merged into Burgundy: a one-off script (deleted,
never committed) renamed the one Maroon item's colour, without
rematching. In `shared/colorPalettes.json` the Maroon palettes became
Burgundy ones; the three that duplicated a Burgundy palette were deleted
(maroon-olive-green-gold, maroon-teal-gold, maroon-forest-green-camel), two
were folded into theirs (maroon-navy-grey added Light Blue to
burgundy-cream-grey; maroon-black-grey added White and Cream to
burgundy-black-grey) and the rest were renamed burgundy-*. The same day
the women's and unisex subtypes Tube top (a top, copied from
Halter/strappy top) and Maxi dress (a onepiece, copied from Summer dress)
were added. On 3 November 2026 the subtype Warm jumper was renamed Chunky knit jumper (no items had it), and its score with Oversized shirt and Buttondown shirt set to 50 for every gender.

`evaluateItemAnalysis.js` is kept for now: it re-runs the photo analysis
on a user's saved items and writes a side-by-side report to
`server/scripts/reports/` (git-ignored), changing nothing. It is to become
the backfill script, then be deleted.

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
| Style quiz pairing questions / their pairs and points | `core/constants/pairingQuestions.js` / `server/constants/pairingQuestions.js` (see 2.6) |
| Today page weights, tiers and cap | `server/constants/todayOutfits.js` |
| Today-only points: favourite item / palette | `FAVOURITE_ITEM_BONUS` / `FAVOURITE_PALETTE_BONUS` in `server/constants/todayOutfits.js`, logic in `server/services/todayScoreService.js` (7.1) |
| Seasonality points, season temperature bands, season-named types | `server/constants/seasonality.js`, logic in `server/services/seasonalityService.js` (3.8, 7.1) |
| Fabrics and their seasons | `shared/fabrics.json` |
| Palette seasons | `seasons` in `shared/colorPalettes.json` |
| Today's "few outfits" messages | `shared/todayMessages.json` |
| Days a rejected outfit is held back / places it's kept out of | `REJECTION_COOLDOWN_DAYS` / `REJECTED_OUTFIT_TOP_GAP` in `server/constants/scoring.js` |
| Too hot / too cold shift, mismatch penalty | `TEMPERATURE_FEEDBACK_SHIFT`, `LEARNING_DELTAS.mismatched` in `server/constants/scoring.js` (7.3) |
| Favourite score | `FAVOURITE_SCORE` in `src/utils/matchScore.js` |
| Temperature numbers | `server/constants/temperatureGroups.js`, see `temperature-ranges.md` |
| Remove the temporary score display | see 7.5 |
| One-off database updates | `server/scripts/`, see Part 11 |

Tests: `server/specs/` (`matchService`, `matrixService`,
`outfitScoreService`, `outfitEvaluator`, `styleColorService`,
`matchScoreService`, `matchScoreBaseline`, `pairingQuizService`, `matchRejectionService`, `seasonalityService`, `todaySelectionService`,
`mismatchRules`, `temperatureFeedbackService`,
`matchRefreshService`, `matchProtection`,
`presetTemperatureService`,
`temperatureService`,
`colorPalettes`). Run them with `cd server && node --test specs/*.spec.js`.
