# Phone cut-out: plan

> **Superseded in part (2026-11-18):** Cloudinary is gone. The backup is now
> Cloudflare (`context/cloudflare-migration-plan.md`), always on, with a
> test-only notice; the strict build (`preview-strict`,
> `CUTOUT_STRICT_TEST`) was removed. The test steps below that mention them
> are history.

Cutting garments out of photos **on the phone** instead of with Cloudinary's
paid background removal (~80% of a new user's cost, `context/cost-plan.md`).

Status (2026-11-17): **built, checked, NOT deployed.** Backed up on its own
git branch, `phone-cutout`, so nothing is live. Server tests 403/403 pass,
the phone app bundles for Android and iPhone. The cut-out was proven on
Android in a standalone test app (since deleted).

**Coming back to this? Start at "Deploying it later" just below.**

## Backing it up (without deploying)

Pushing **`main`** deploys: Vercel rebuilds the live server and web app
from it. So this work lives on its own branch. From the project root:

```
git switch -c phone-cutout
git add -A
git commit -m "Phone cut-out: built, not deployed"
git push -u origin phone-cutout
```

- A push to any branch other than `main` gets only a Vercel *preview*
  deployment (its own temporary address). The live server, the web app
  and the phone app don't change.
- To carry on with other work, `git switch main`. The cut-out files leave
  your folder but stay safe on the branch (`git switch phone-cutout` brings
  them back).
- Keep it off `main` until you deploy: the branch changes the app version
  to **1.1.0**, and over-the-air updates only reach a phone app with the
  same version. Your installed app is 1.0.0, so with 1.1.0 on `main` your
  everyday `eas update`s would stop reaching it.

## Deploying it later, step by step

Read sections 2–5 first if you've forgotten how it works. Do one step at a
time and check it before the next.

1. **Bring `main` up to date with the branch** (this deploys the server and
   web app):
   ```
   git switch main
   git merge phone-cutout
   git push
   ```
   Check: Vercel shows the deployment as Ready; adding an item on the web
   still works. The server change is safe on its own: it only acts on
   fields the new app sends.
2. **Install the new package** (expo-build-properties). From `mobile/`:
   `npm install`
3. **Test build 1, strict** (Cloudinary backup off, failure reasons shown).
   From `mobile/`:
   ```
   npx eas-cli@latest build -p android --profile preview-strict
   ```
   Answer **n** if it asks about an emulator. Install it from the build
   page (it replaces your current app). Work through section 7. Any photo
   that keeps its background means the phone cut-out failed, and the
   screen says why.
   Don't send `eas update`s to the `preview-strict` channel: they'd turn
   the strict build normal.
4. **Test build 2, as it will launch** (Cloudinary backup on, no messages):
   ```
   npx eas-cli@latest build -p android --profile preview
   ```
   Install, test section 7 again, and force a fallback (a photo with
   nothing in it, airplane mode during the cut-out): the photo should
   come back with Cloudinary's cut-out.
5. **Back to normal.** Everyday changes go out as before
   (`context/releasing-mobile.md`): `eas update --channel preview` now
   reaches this 1.1.0 build.
6. **Watch it.** Vercel logs: search for `phone couldn't cut the photo out`.
   Cloudinary dashboard: background removals should barely move.
7. **Re-measure costs.** Run the Cloudinary snippet in
   `context/cost-plan.md` ("Re-measuring") to get the real storage per
   piece (0.75 MB is an estimate), then update the cost page.
8. **iPhone, later:** Phase D in section 6, once you have the Apple
   developer account.

If anything goes wrong: section 8, Rollback. An older build can be
reinstalled from expo.dev → LovedWornSeen → Builds.

### What was built (Phase A)

- `mobile/modules/garment-cutout/`: Android (Kotlin, from the test app,
  plus `prepareAsync` warm-up and cache clearing) and iPhone
  (`ios/GarmentCutoutModule.swift` + podspec, Apple Vision, **UNTESTED**).
- `mobile/src/platform/garmentCutout.js`: `cutOutPhoto` (15 s limit,
  failure report), `CUTOUT_STRICT_TEST`, warm-up called from
  `src/app/_layout.jsx` when signed in.
- `core/hooks/usePhotoAnalysis.js`: `cutOut` / `cloudinaryBackup` options,
  `photoChoice` (swap), `cutoutFailure`; unused uploads deleted on save.
  `core/api/images.js`: phone cut-outs uploaded as `<random>_cutout`.
  `core/api/analysis.js`: `background` + `cutoutFailure` sent.
- Phone screens: `item/add.jsx`, `AnalysedItemReview.jsx` ("Use original
  photo", asks before "Choose another photo" if edited), `PhotoChoice.jsx`,
  `PhotoPicker.jsx` + `ItemPullUpView.jsx` (cut-out when an item's photo is
  changed, with the swap).
- Server: `services/phoneCutoutService.js` (reads `background`, logs
  failures), `controllers/analysisControllers.js` uses it. Tests:
  `specs/phoneCutout.spec.js`, `specs/backgroundRemoval.spec.js`.
- Web: `src/styles/sharedComponents.css` pads `_cutout` images like `_nobg`.
- `mobile/app.json`: version 1.1.0, shrinking off (`expo-build-properties`).
  `mobile/eas.json`: `preview-strict` profile (channel `preview-strict`,
  `EXPO_PUBLIC_CUTOUT_STRICT_TEST=1`).
- `context/cost-plan.md`: new figures.

**Changed from the plan while building:** no thumbnails are made on the
phone. Neither app ever reads `thumbnailUrl` (both resize through
Cloudinary URLs, `core/utils/getImageUrl.js`), so they'd only add uploads
and storage. Items from the phone have a `_cutout` image only.

**Don't send over-the-air updates to the `preview-strict` channel** without
`EXPO_PUBLIC_CUTOUT_STRICT_TEST=1` set, or the strict build turns normal.

---

## 1. What's already proven

- Android: Google ML Kit subject segmentation, through our own Expo module
  (now `mobile/modules/garment-cutout/`). Worked well on the user's phone in
  a standalone test app (build 3, 2026-11-13; the test app was deleted
  2026-11-17, its Expo project "garment-cutout-test" can be deleted on
  expo.dev).
- Lessons from the test app:
  - **Code shrinking must be off** (or ML Kit kept by keep rules). Expo SDK
    58 shrinks release builds by default (`android.enableMinifyInReleaseBuilds`),
    which broke ML Kit with a `NullPointerException ... dm3.a` inside its
    own code. Fixed with `expo-build-properties`:
    `{ "android": { "enableMinifyInReleaseBuilds": false, "enableShrinkResourcesInReleaseBuilds": false } }`.
  - The model is downloaded by Google Play services on first use; the bridge
    asks for it (`ModuleInstall`) and waits.
  - A module's `.gitignore` must use `/android` and `/ios`, never `android/`,
    or EAS doesn't upload the module's native code.
  - No need to commit or push for EAS builds: it uploads the local folder.

## 2. Decisions (all confirmed by the user, 2026-11-17)

| Decision | Choice |
|---|---|
| Android cut-out | Google ML Kit (own bridge, not a community package) |
| iPhone cut-out | Apple Vision (`VNGenerateForegroundInstanceMaskRequest`, iOS 17+, built into iOS). Written now, **untested** until the paid Apple developer account exists. Everything must work on iPhone eventually (memory: ios-parity). |
| Backup when the phone can't | Cloudinary background removal, as today |
| Keep the original photo on Cloudinary? | **No** (nothing shows it; it's most of the storage cost) |
| Thumbnail | ~~Made on the phone~~ **None** (changed while building: nothing reads thumbnails) |
| Code shrinking in the real app | **Off**, the tested setup |
| Order of the add flow | **In one go**, like today: the phone cuts out, then upload + Gemini straight away, then the review screen. Nothing ever waits at Save (Save goes on to matching/outfits). |
| Changing the photo on the review screen | **"Use original photo"** swaps the image only: no new analysis. **"Change photo"** (a different photo) runs the cut-out and the analysis again. |
| "Change photo" after the user edited details | The fresh analysis replaces the details. If the user has edited anything, ask first ("Your changes will be replaced"). |
| Bad cut-outs | **Entirely the user's call** (swap to the original or change the photo). No automatic quality checks. The phone only "fails" when it errors or returns nothing. |
| Changing an existing item's photo (item edit) | Also cut out on the phone, with the cut-out/original choice in the form. If the phone fails: **the original as it is**, no Cloudinary (same as today's edit). Uploaded on Save, as today. |
| Why a cut-out failed | Shown **only in the first test build**. Never in the second test build or in production. |
| Web | Unchanged (always Cloudinary, today's flow). Web will be taken offline eventually. |

## 3. The golden rule

**A photo is never blocked because its background couldn't be removed.**
If the phone can't cut it out, and the backup can't (or is switched off),
the item is saved with the photo as taken. The only thing that may stop an
add is the photo not reaching the server at all (no internet), which is
the same as today, with a "try again".

## 4. How it will work

### Adding an item (phone)

```
pick photo
  └─ phone cut-out (time limit 15 s; normally ~1 s)
        ├─ ok ─────> upload the cut-out + its thumbnail
        └─ failed ─> upload the photo as taken
                       (test build 1: show why it failed)

  AI on:  server /items/analyse
            ├─ told "already cut out"        → no Cloudinary, Gemini only
            ├─ phone failed + backup ON      → Cloudinary removes it, then Gemini (today's flow)
            └─ phone failed + backup OFF     → Gemini on the photo as taken
          → review screen (image + filled-in details)

  AI off: phone ok                → straight to the form, nothing else on the server
          phone failed + backup ON  → server /items/remove-background (today's flow) → form
          phone failed + backup OFF → form with the photo as taken

Review screen / form:
  • "Use original photo"  → swap to the photo as taken (uploaded at that
                            moment if it wasn't already), with its own phone
                            thumbnail. NO new analysis. Can swap back.
  • "Change photo"        → a different photo: cut-out + upload + analysis
                            again. If the user edited details, ask first;
                            the new analysis replaces them.
  • Save → matching / outfits (unchanged)
```

When the phone cut-out works, only the cut-out is uploaded; the original is
uploaded only if the user taps "Use original photo". When the phone failed,
the original is already uploaded, so swapping (e.g. away from Cloudinary's
cut-out) costs nothing. Every upload not used by the saved item is deleted
(existing clean-up, `unsavedImagesRef` in `core/hooks/usePhotoAnalysis.js`).

### Changing an existing item's photo (item edit)

```
pick photo → phone cut-out
  ├─ ok ─────> form shows the cut-out, with "Use original photo" (swap back and forth)
  └─ failed ─> form shows the photo as taken (no Cloudinary)
Save → upload the chosen image + thumbnail (core/wardrobe/saveWardrobeItem.js,
       which already uploads at save time); old images deleted as today.
```

### Pieces

1. **Bridge in the real app.** `mobile/modules/garment-cutout/` with the Android
   half (from the test app) and a new iPhone half (Swift, Apple Vision,
   marked UNTESTED). Same JS functions on both: `cutOutGarment(uri)` and a
   thumbnail maker. Warm-up (start the model download) when the app opens.
   Cache folder cleared each time.
2. **Shared add-photo flow** (`core/hooks/usePhotoAnalysis.js`, used by web
   **and** phone). `core/` can't import phone-only code, so the phone passes
   the cut-out in (e.g. `usePhotoAnalysis({ useAi, cutOut })`); the web
   passes nothing and keeps today's flow.
3. **Phone screens**: "Use original photo" and "Change photo" on the review
   screen and the AI-off form; the cut-out in the item-edit photo change.
4. **Server** (`server/controllers/analysisControllers.js`,
   `server/services/backgroundRemovalService.js`, `imageService.js`):
   - `/items/analyse` and `/items/remove-background` accept new fields:
     "already cut out" (skip Cloudinary), "backup off" (don't remove), and a
     short failure reason from the phone. Defaults stay as today, so the web
     and older apps behave the same.
   - The image fields worked out from the image id (thumbnail, original)
     must change: phone cut-outs have a thumbnail but **no original**.
     Today `derivedImageFields` assumes every `_nobg` image has both, and
     would point at an original that doesn't exist.
   - Logs every phone failure it hears about (platform, OS version, reason)
     in Vercel's logs, including after launch.
5. **The test switch**: one `EXPO_PUBLIC_...` setting, set per build profile
   in `mobile/eas.json`. On in `preview-strict` only (section 6).
6. **Knowing it works after launch**: the server log (item 4) and the
   Cloudinary dashboard: background-removal usage should barely move once
   live. If it climbs, phones are falling back.

## 5. Every way it could fail, and what happens

### Before the cut-out

| # | What goes wrong | What we do |
|---|---|---|
| 1 | The app version has no bridge: web, Expo Go, or an over-the-air update reaching an older build | `isCutoutAvailable` is false → today's flow. **Also bump the app version** (e.g. 1.1.0) for this build, so `runtimeVersion` (policy appVersion) changes and new JS can't reach old builds by update. |
| 2 | iPhone older than iOS 17 | Bridge reports unavailable → backup |
| 3 | Android phone without Google Play services (e.g. Huawei) | Model can't load → backup |
| 4 | ML Kit's model not downloaded yet (first use, no internet, Play services slow) | Warm-up when the app opens. **15 s time limit** on the whole cut-out, then backup. (The test app waits up to 90 s: too long for real use.) |

### During the cut-out

| # | What goes wrong | What we do |
|---|---|---|
| 5 | Nothing found (empty result) | Counts as failed → backup |
| 6 | **Wrong or partial cut-out** (only part of the garment, the hanger, a person, the bed). Not an error. | **The user decides** on the review screen ("Use original photo" / "Change photo"). Deliberately no automatic checks. |
| 7 | Phone runs out of memory (huge photo, older phone) | Photo is shrunk while being read (max 1600 px); every error is caught. A full out-of-memory crash can't be fully ruled out: test on an older phone. |
| 8 | Unusual photo types: HEIC, iPhone Live Photos, screenshots, PNGs with transparency, tiny images | Read failure → backup. Test a few of each. |
| 9 | Photo comes out sideways | Bridge reads the rotation (EXIF) on Android; the iPhone half must do the same. In the test list. |
| 10 | It hangs or is slow | 15 s time limit → backup |
| 11 | User leaves, or picks another photo, mid-way | Existing "ignore stale results" (`runRef`) and clean-up of unsaved uploads handle it, as today. |
| 12 | Cache fills up with old cut-out files / phone storage full | Clear the bridge's cache folder each time. Save failure → backup. |

### Uploading

| # | What goes wrong | What we do |
|---|---|---|
| 13 | No internet / upload fails | Same as today: "Couldn't upload the photo. Please try again." This is the one case that can stop an add, unavoidably. |
| 14 | Image uploads, thumbnail doesn't | The item must still show: thumbnail is optional; without one the app uses the main image (Cloudinary can still resize it on delivery). Never point at a thumbnail that doesn't exist. |
| 15 | Cloudinary upload preset rejects the file (format WebP/PNG, size limits, preset settings) | Check the preset before building. If the cut-out upload is rejected → upload the photo as taken → backup. |
| 16 | Cut-out naming: the web pads `_nobg` images (`sharedComponents.css`), and the server works out thumbnails from `_nobg` ids | Check every place that reads `_nobg` while building, and name/mark phone cut-outs so web and phone both show them right. |
| 17 | Item never saved, or the user swapped images → unused uploads left behind | Existing clean-up (`unsavedImagesRef`) must cover every upload: cut-out, original, thumbnails. |
| 18 | "Use original photo" upload fails | Stay on the cut-out and say so; the user can try again. |

### On the server

| # | What goes wrong | What we do |
|---|---|---|
| 19 | New app talks to old server | **Deploy the server first.** It's safe alone: it only behaves differently when the new fields are sent. |
| 20 | Cloudinary backup fails (still working after 45 s, error, credits used up) | Already handled today: `removeBackgroundOrNull` → photo as taken. |
| 21 | Gemini analysis fails | Unchanged: "failed" step, the user fills it in, photo attached. |
| 22 | Test build 1 settings (backup off, reasons shown) reaching users | Only the `preview-strict` profile has them; `preview` and `production` never do. |

### Elsewhere

| # | What goes wrong | What we do |
|---|---|---|
| 23 | Shrinking setting forgotten in the real app | Every cut-out would fail and fall back silently, and cost money. Test build 1 shows the reasons, so it would be caught there. In the checklist. |
| 24 | ML Kit (beta) changes or is withdrawn; Apple changes Vision | Backup covers it; server log shows it. |
| 25 | Mixed look: old Cloudinary cut-outs next to new phone ones | Compare a few side by side during testing. |
| 26 | First-use model download uses some mobile data | Small; acceptable. |
| 27 | "Change photo" uses another Gemini call and one of the daily allowance | Acceptable; it's a different photo. |

## 6. Steps (careful order)

Nothing is committed by Claude; the user does all commits.

**Phase A: build (Claude)**
1. Check the Cloudinary upload preset accepts WebP/PNG (item 15).
2. Copy the bridge into `mobile/modules/garment-cutout/`; add the iPhone half
   (marked UNTESTED), the thumbnail maker, the 15 s time limit, cache
   clearing and warm-up.
3. `mobile/app.json`: shrinking off (`expo-build-properties`), app version
   bump.
4. `core/` + phone screens: cut-out before upload in the add flow (AI on and
   off); "Use original photo" (swap, no new analysis) and "Change photo"
   (everything again, ask first if edited); the item-edit photo change; the
   failure reason sent to the server; clean-up of every unused upload. Web
   keeps today's flow.
5. Server: the new fields, derived image fields without an original, the
   failure log. Tests in `server/specs/` (including
   `backgroundRemoval.spec.js`).
6. `mobile/eas.json`: the `preview-strict` profile (section 6, Phase B).
7. Update `context/cost-plan.md` and the cost page with background removal
   mostly gone.

Phase A is done. The exact commands for Phases B and C are in "Deploying
it later" at the top.

**Phase B: test build 1, strict (user)**

Profile `preview-strict`: **Cloudinary backup OFF, failure reasons SHOWN.**

8. Deploy the server (merge `phone-cutout` into `main` and push; Vercel
   deploys it).
9. Build `preview-strict`, install, test the list in section 7. Any photo
   that keeps its background = the phone cut-out failed, and the screen
   says why. Nothing is hidden by Cloudinary.

**Phase C: test build 2, as launched (user)**

Profile `preview`: **Cloudinary backup ON, NO failure messages**, exactly
as production will be.

10. Build `preview`, install, test the list again, including forcing a
    fallback (a photo with nothing in it; airplane mode during the
    cut-out). The photo should come back with Cloudinary's cut-out, and no
    technical messages appear anywhere.

**Phase D: iPhone (once the Apple developer account exists)**
11. `eas build -p ios` (Expo sets up certificates), register the iPhone
    (`eas device:create`) or use TestFlight. Test build 1 (strict) first,
    then test build 2, same tests. It's also the first time the whole app
    runs on an iPhone: test everything, not just photos.

**Phase E: tidy up**
12. ~~Delete the standalone test app~~ Done 2026-11-17. Optional: delete the
    "garment-cutout-test" project on expo.dev.

## 7. Test list

- 20–30 real photos: pale on pale, on a hanger, on a bed/floor, being worn,
  patterned, shoes, a photo with two items, a photo with nothing in it.
- Camera and library; cropped and not cropped.
- Review screen: "Use original photo" and back again (no new analysis);
  "Change photo" with and without edited details (asks first when edited);
  the saved item shows the chosen image.
- AI off: the form shows the cut-out; swap works; Save works.
- Changing an existing item's photo: cut-out/original choice; phone failure
  gives the original; old images deleted after Save.
- Sideways-held photos (rotation).
- HEIC / screenshots / a PNG.
- First run after a fresh install (model download), with and without Wi-Fi.
- Airplane mode partway through.
- Leave the add screen mid-way; pick another photo mid-way.
- An older/slower phone if possible.
- Item list, item page, outfits and Today: images look right, thumbnails
  load, deleting an item deletes its images.
- Build 2 only: forced fallback gives Cloudinary's cut-out; no technical
  messages anywhere.

## 8. Rollback

- Server change is backwards compatible: leave it.
- App: build without the cut-out (or with the bridge reporting unavailable),
  and everything goes back to Cloudinary.
- Nobody else has the app yet, so there are no users to migrate.

## 9. Settled by Claude while building (user can override)

- Cut-out naming on Cloudinary (item 16): whatever keeps web + phone right.
- Phone failures in the item-edit photo change aren't logged on the server
  (that flow doesn't call the server before Save; the user sees the
  original).
- When the phone cut-out works, the original is only uploaded if the user
  taps "Use original photo" (saves uploading two images for every photo).
