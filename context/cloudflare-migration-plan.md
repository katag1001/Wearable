# Cloudflare migration: plan

Taking the website offline, then moving every image (storage, sizes,
background removal) from Cloudinary to Cloudflare, with no connection to
Cloudinary left at the end.

Status (2026-11-18): **phases 1 and 2 built (uncommitted, not deployed).**
The Worker `lws-cutout` is deployed (https://lws-cutout.katarinag1001.workers.dev,
secret set, `CUTOUT_WORKER_URL/KEY` in `server/.env`). End-to-end test
passed against real R2 + the Worker (13/13: upload links, Cloudflare
cut-out, the photo as taken, phone cut-out, owner-only serving, uploads
deleted once processed, discard, nothing left behind). Phase 3: cost page
and docs done, CLOUD_* removed from `server/.env`. Left for the user:
close Cloudinary, sign up again then run setAdmin, and at deploy time set
R2_* + CUTOUT_WORKER_* in Vercel and remove CLOUD_* there.

Phase 1 as built: `src/` is now `App.jsx` (routes `/` Coming soon,
`/login`, `/trends` admin, everything else → `/`), `pages/ComingSoon.jsx`,
`pages/Login.jsx` (goes to /trends once logged in), `pages/Trends.jsx`
(+ Log out), `components/login/LoginForm.jsx` (no Register link) +
`ProtectedRoute.jsx`, `components/trends/*`, and the CSS they use. 91
web-only files deleted after checking nothing kept, `core/`, `mobile/`,
`server/`, `api/` or `shared/` used them. `index.html`: Cloudinary upload
widget removed, title LovedWornSeen. `src/main.jsx` no longer passes
Cloudinary settings. Packages removed (used only by deleted web pages):
`@emotion/react`, `@uidotdev/usehooks`, `react-spinners`. README updated.
Checks: website builds (305 KB), lint clean, 419/419 server tests, phone
app bundles for Android and iPhone.

Background: Cloudinary costs ~$99 a month minimum and ~$3,000 at 10,000
users; Cloudflare R2 + Images is estimated at ~$5 and ~$18
(`context/cost-plan.md`). A standalone test (2026-11-18, 20 real photos)
passed: sharp, clean cut-outs including white-on-white, lace and thin
straps; transparency kept in WebP; saving back to storage worked; ~2-5 s
per photo; all free (`context/cloudflare-images-test-plan.md`).

Already done: the user deleted their test account (all its items and
Cloudinary photos). The only other account, Konrad's, has no items or
photos. So there is **no data to move**: the new system starts empty.

**Keep everything free while testing.** No Workers Paid plan and no
domain until launch: the background-removal Worker runs on the free
Workers plan (as the test did); photos are kept private through our own
server. The paid, faster setup is on `context/before-launch.md`.

---

## Decisions

| Decision | Choice |
|---|---|
| Website | **Taken offline** (phase 1): a "Coming soon..." page, plus login and /trends for admin. The Vercel server keeps running. |
| Storage | **One private R2 bucket** (no public address). One bucket, not dev + live: local testing uses the live database, so a separate bucket would break photos. |
| Who can see photos | **Only the logged-in owner.** While testing: through our server (`GET /api/images/...`, login required, own photos only). Before launch: a Cloudflare Worker with expiring signed links on our own domain (before-launch list). |
| Sizes stored | **Two per photo, WebP**: ~900 px (item page) and ~300 px (grids, outfits). No originals, no full-size cut-outs. Gemini's grey JPEG is made when needed, never stored. |
| Background removal | **The phone first** (ML Kit / Apple Vision). If it can't: **Cloudflare**, every time (no "backup off" mode any more). Same for changing an item's photo. |
| Test notice | While testing, the app **tells the user when Cloudflare removed the background**. One on/off setting; removed before launch (before-launch list). |
| Deleting an account | **Type DELETE to confirm**, with a message that all their stored data will be removed. Deletes all their photos from R2 too. |
| Cloudinary | **Removed completely**: code, packages, settings, then the account. |

---

## Phase 1: take the website offline (do first)

Why first: the website also uploads to Cloudinary; removing it first means
phase 2 only has to handle the phone app and the server, and the old web
code (messy, partly broken) stops needing to work.

**Must not change (the phone app and server depend on them):** `core/`,
`shared/`, `server/`, `api/`, `mobile/`, `vercel.json`'s API rewrite.
Checked: nothing in `mobile/` or `core/` imports from `src/`.

1. **New website** (`src/`): "Coming soon..." at `/`; the existing **login**
   page (admin needs to sign in); **/trends** (the admin trends editor,
   `src/pages/Trends.jsx` + `src/components/trends/`). Everything else
   redirects to "Coming soon".
2. **Delete web-only code**: the other pages (Homepage, Clothes, Matches,
   BuildMatches, StyleQuiz, User, Register...) and their components, but
   only after checking each isn't used by what stays. Keep the login flow's
   shared pieces (`core/hooks/useAuthSession.js` etc. are in `core/`, so
   they stay anyway).
3. **Web-only settings**: the website's Cloudinary settings (`.env`
   `VITE_CLOUD_NAME`, `VITE_UPLOAD_PRESET`) are no longer needed.
   Web-only packages in the root `package.json` are removed **only** if
   nothing else uses them (the server shares that file).
4. **Checks before pushing**: the website builds; login + /trends work
   against the local server; all server tests pass; the phone app bundles
   for Android and iPhone (`npx expo export`).
5. **Deploy**: pushing `main` deploys it, together with the commits already
   waiting (phone cut-out, weather, docs), which are safe for the current
   phone app. Set `MET_CONTACT` in Vercel first (`context/before-launch.md`).

## Phase 2: Cloudflare instead of Cloudinary

### 2a. Cloudflare set-up (user, with the README-style steps)

1. Delete the test: run its cleanup, delete the `lws-image-test` bucket,
   the test **API token** (its secret was pasted in chat) and the test
   Worker; Claude deletes `experiments/cloudflare-images-test/` and
   `context/cloudflare-images-test-plan.md`.
2. Create the real bucket, e.g. **`lws-images`**, **private** (don't turn on
   a public address).
3. A new R2 API token, Object Read & Write on that bucket only.
4. Deploy the background-removal Worker (free plan) with its secret.
5. Settings in Vercel (Production + Preview) and `server/.env`:
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
   `CUTOUT_WORKER_URL`, `CUTOUT_WORKER_KEY`.

### 2b. How a photo goes in

```
phone picks a photo
  → phone cut-out (as now) - or it fails
  → phone shrinks what it uploads (≤1600 px) and asks our server for a
    signed upload link (POST /api/images/upload-link): a short-lived link
    for one file under users/<userId>/uploads/, images only
  → phone uploads straight to R2 with it
  → server processes it (inside /items/analyse, the AI-off "prepare photo"
    call, and when an item's photo is changed):
      - phone failed → the Worker removes the background (Cloudflare);
        the reply says so (for the test notice)
      - makes the 900 px and 300 px WebP sizes (sharp), trimmed to the
        garment; stores them under users/<userId>/items/<id>-900.webp / -300.webp
      - deletes the upload
      - for Gemini: the grey 1024 px JPEG from the cut-out, in memory
  → the item is saved with its image key
```

- "Use original photo" uploads the photo as taken and processes it the
  same way (no background removal).
- Files that are uploaded but never saved (closed the screen, chose
  another photo) are deleted, as now (`unsavedImagesRef`), through a
  server route that only deletes the user's own files; the server also
  refuses uploads that are too big.

### 2c. How a photo is shown

Items store **one image key** (e.g. `users/<id>/items/<photoId>`) instead of
`imageUrl` / `cloudinaryId` / thumbnail / original fields. The app builds
the link in one place (`core/utils/getImageUrl.js` → an image-source helper
returning `{ uri, headers }` with the login token), and expo-image caches it
on the phone. While testing: `GET /api/images/<key>-300.webp` on our server
checks the login and that the key is the user's own, then streams it from
R2. Before launch this one helper switches to the Cloudflare Worker.

### 2d. Deleting

Deleting an item, replacing its photo, or deleting an account deletes the
files from R2 (an account: everything under `users/<userId>/`).

### 2e. Delete account: type DELETE

Profile → Delete account opens a confirmation that says all their stored
data will be permanently removed (clothes and photos, outfits, plans,
Today, preferences) and only enables Delete once they type **DELETE**.

### 2f. Background removal and the test notice

- Remove the "strict test" mode: `EXPO_PUBLIC_CUTOUT_STRICT_TEST`, the
  `preview-strict` build profile, `CUTOUT_STRICT_TEST` in
  `mobile/src/platform/garmentCutout.js`, the failure-reason note
  (`PhotoChoice.jsx` `CutoutTestNote`) and the server's `background: "keep"`.
  Cloudflare is always the backup.
- The test notice: one setting, `SHOW_CLOUDFLARE_CUTOUT_NOTICE` in
  `mobile/src/platform/garmentCutout.js` (true while testing). When the
  server says Cloudflare removed the background, a small notice appears
  ("Background removed by Cloudflare: the phone couldn't do it"). Taken
  out before launch (`context/before-launch.md`).
- Failures are still logged on the server (platform, OS version, reason).

### 2g. Removing Cloudinary

Server: `server/cloudinary.js`, `controllers/cloudinaryControllers.js` +
its route, `services/backgroundRemovalService.js`,
`constants/backgroundRemoval.js`, the Cloudinary parts of
`services/imageService.js` and `services/analysisImageService.js`, the
`cloudinary` package, `CLOUD_*` settings (server/.env, Vercel). App:
`core/api/images.js` (Cloudinary upload), `cloudName` / `uploadPreset` in
`core/config.js`, `mobile/src/platform/config.js`, `EXPO_PUBLIC_CLOUD_NAME`
/ `EXPO_PUBLIC_UPLOAD_PRESET` (mobile/.env, EAS). Database: the
Cloudinary-specific item fields replaced by the image key. Docs: README,
context docs. Tests rewritten (`backgroundRemoval`, `imageService`,
`phoneCutout` specs) plus new ones for keys, ownership and sizes.

**Check:** `server/scripts/evaluateItemAnalysis.js` (the AI accuracy check)
loads its photos from Cloudinary by the old items' ids, and those photos
were deleted with the account. It needs its own photos (e.g. a local
folder) before it can run again; decide then.

### 2h. Checks

Server tests; phone bundles (Android + iPhone); a local run on the phone:
add items (phone cut-out, and a forced Cloudflare backup with the notice),
"Use original photo", change a photo, delete an item, delete the account
(typed DELETE), confirm R2 is empty afterwards; photos load only when
logged in as their owner.

## Phase 3: tidy up

1. Empty and close the Cloudinary account; remove its settings everywhere.
2. Update the cost page (`context/cost-plan.md` + `.html`): Cloudinary gone,
   R2 + Images (and, before launch, Workers $5 + domain).
3. Sign up again with the same email, then make it admin:
   `node server/scripts/setAdmin.js katarinag1001@gmail.com --confirm`.
4. Update `context/phone-cutout-plan.md` (no strict mode; Cloudflare backup;
   the notice) and `context/before-launch.md`.

Not in this plan: the next full app release (new build); the user will do
that afterwards.
