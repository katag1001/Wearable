# Mobile app build plan

A React Native (Expo) app, **LovedWornSeen** (`com.katag1001.lovedwornseen`),
the mobile version of Wearable for iOS and Android, built in this
repo next to the existing Vite web app. Both apps talk to the same Express
API on Vercel. Logic shared by web and mobile lives in one place; each app
keeps only its own UI.

Status (2026-10-15): prep, scaffold and connection check done (passed on
an Android phone). The build order was reworked so no logic is written
twice - see "Build order". Steps 1-11 built - every feature is on both apps; step 12 (EAS builds) is set up and waiting on your Expo login - see context/mobile-release.md. See "Built so far" at the end.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Backend | Keep the Express API on Vercel Hobby (`wearable-psi.vercel.app/api`) unchanged | It's already a standalone API with bearer-token auth, which works from a phone as-is. No CORS on native. |
| Web app | Stays Vite + React, stays at the repo root | No churn for the working app |
| Mobile framework | Expo (latest SDK at setup) + React Native, **expo-router** for navigation | File-based routes like `src/pages/`; runs in Expo Go |
| Shared client code | New top-level `core/` folder, imported by both apps | One copy of queries, caches, scoring, constants, API calls and screen logic |
| `shared/` | Unchanged - JSON data used by server **and** clients | Keeps "server+client data" separate from "client logic" |
| Builds / releases | EAS Build (cloud), EAS Submit, EAS Update | Only practical iOS route from Windows; free tier to start |
| Testing devices | Android phone in Expo Go; iOS via any borrowed iPhone running Expo Go, later TestFlight | Expo Go on iOS needs no Apple account |
| Design | Clean, minimal, reuses the web palette (warm neutrals, Inter-like system font) | Matches the brand; little to invent |

## Target repo layout

```
personal_project/
├── api/                 Vercel entry (unchanged)
├── server/              Express API (unchanged)
├── shared/              JSON data for server + clients (unchanged)
├── core/                NEW - client logic shared by web + mobile
│   ├── config.js          configureCore(): apiUrl, Cloudinary, storage
│   ├── api/               axios client + one file per resource
│   ├── assets/            icons + style-quiz images (moved from src/assets)
│   ├── cache/             paged list cache + provider
│   ├── constants/         options, subtypes, footwear, quiz, weekdays
│   ├── hooks/             screen logic hooks (no DOM, no RN)
│   ├── theme/tokens.js    colours, spacing, font sizes
│   ├── today/  footwear/  weather/  clothes/
│   └── utils/             query builders, scoring, images, dates
├── src/                 Web UI only (components, pages, CSS)
├── mobile/              NEW - Expo app, mobile UI only
└── context/
```

### Rules for `core/`

- May import: `react`, `axios`, `../shared/*.json`, and other `core/` files.
- Must **not** use `window`, `document`, `localStorage`, `import.meta.env`,
  DOM elements or React Native components. Anything platform-specific comes
  in through `configureCore()` or a hook argument.
- Never imports from `src/` or `mobile/`.
- `eslint.config.js` lints `core/**` with no browser globals, so a stray
  `localStorage` or `window` fails lint.

## How both bundlers find `core/`

- **Alias `@core`** → `core/`.
  - Web: `resolve.alias` in `vite.config.js`.
  - Mobile: `paths` in `mobile/jsconfig.json` (Expo reads it natively).
  - Inside `core/` use relative imports.
- **Web (Vite):** `core/` is inside the Vite root. Its `react`/`axios`
  imports resolve to the root `node_modules`, the web's own copies.
- **Mobile (Metro):** `mobile/metro.config.js`:
  - adds `core/` and `shared/` to `watchFolders`, so edits there reload
    the app;
  - uses a custom `resolver.resolveRequest` that maps `@core/...` to
    `core/`, and resolves any package import made from **outside**
    `mobile/` (i.e. from `core/`) as if it came from `mobile/`. So
    `core/` always gets the mobile app's React and axios, never the
    web's copies in the root `node_modules`.

  Two Reacts in one app causes "Invalid hook call". The web is on React
  19.1.1 and Expo SDK 57 on 19.2.3. Verified: the Android bundle contains
  only 19.2.3.

  This isn't Expo's automatic monorepo support on purpose. That needs npm
  workspaces, which would hoist both apps into one `node_modules` and
  force a single React version.
- `mobile/` installs its own `axios` (and Expo pins its own `react`), so the
  two apps can be on different React versions safely.

## Platform adapters

Everything platform-specific in the web code goes through one of these.

| Concern | Web today | `core/` interface | Web adapter | Mobile adapter |
|---|---|---|---|---|
| API URL | `src/config.js` checks `window.location` | `configureCore({ apiUrl })` | Same localhost check, done in `src/main.jsx` | `EXPO_PUBLIC_API_URL` |
| Cloudinary | `import.meta.env.VITE_*` | `configureCore({ cloudName, uploadPreset })` | `VITE_*` | `EXPO_PUBLIC_*` |
| Storage (~40 `localStorage` uses) | `localStorage`, sync | `storage.getItem / setItem / removeItem`, **sync** | `localStorage` itself | In-memory map, hydrated from AsyncStorage at boot, writes persisted in the background. `token` goes to `expo-secure-store` instead. |
| Auth header | `getToken()` copied into ~15 files + axios defaults | `core/api/client.js`: one axios instance, interceptor adds `Bearer` from storage | - | - |
| Image upload | `File` from `<input type="file">` | `uploadImage(fileLike)` builds `FormData` | `File` | `{ uri, name, type }` from `expo-image-picker` |
| Location | `useGeolocation` (usehooks) | `useWeather({ latitude, longitude })` | usehooks | `expo-location` |
| Static images | Vite import → URL string | constants keep `image: importedAsset` | `<img src>` | `<Image source>` (Metro import → asset id) |

**Why a sync storage mirror:** the caches (`todayCache`, `footwearCache`,
the sort cache, the weather cache) and `useState(getCachedToday)` read
storage synchronously. On mobile, all keys load from AsyncStorage once
behind the splash screen, during the existing "checking token" step. After
that, every read is sync and every cache file works unchanged on both
platforms.

## What moves into `core/`

### Straight moves (done in step 2; logic unchanged, only imports and storage/API calls updated)

| From | To |
|---|---|
| `src/utils/clothingQuery.js`, `footwearQuery.js`, `matchQuery.js`, `pageQuery.js`, `pageNumbers.js`, `matchScore.js`, `resolveStyleQuiz.js`, `getImageUrl.js` | `core/utils/` |
| `src/utils/cloudinaryImage.js` | `core/api/images.js` |
| `src/constants/*` (`typeOptions.jsx`, `optionsBank.jsx`, `footwearOptions.jsx` renamed to `.js`; they contain no JSX) | `core/constants/` |
| `src/assets/images/icons/*`, `styles/*`, `wearable_logo.png` | `core/assets/icons/`, `core/assets/styles/`, `core/assets/`. Renamed `.PNG` → `.png`: Metro's extension match is case-sensitive. |
| `src/context/*` (cache, provider, context, hook) | `core/cache/` (the provider has no DOM, so it runs in RN). Requests go through `core/api/lists.js`. |
| `src/hooks/*` | `core/hooks/` |
| `src/components/clothes/uploadComponents/useClothingForm.jsx`, `useClothingDetection.jsx`, `uploadHelpers.jsx` | `core/clothes/` (`.js`) |
| `src/components/matches/useMatchSelection.js` | `core/hooks/` |
| `src/components/today/todayHelpers.jsx` | Split: day/season helpers → `core/utils/dates.js`; weather offset + emoji → `core/weather/weatherCodes.js`; `fetchTodayInfo` → `core/today/todayInfo.js` (the unused `fetchTodayTag` dropped) |
| `src/components/today/todayCache.js`, `todayOutfitSort.jsx`, `outfitRejection.js` | `core/today/` (`.js`); the reject request → `core/api/matches.js` |
| `src/components/today/footwear/footwearCache.js`, `footwearRanking.js` | `core/footwear/` |
| `src/components/today/footwear/footwearApi.js` | `core/api/footwear.js` |
| Fetch + cache half of `src/components/today/autoWeather.jsx` | `core/weather/weatherCache.js` (shared with the outfit sort and shoe box, which had their own copies), `core/weather/openMeteo.js`, `core/today/createTodayOnce.js` + `core/api/today.js` |
| `Homepage.jsx`'s `getCurrentSeason` | Replaced by `getSeason()` from `core/utils/dates.js` (same result with no latitude) |
| `:root` colour and size vars in `src/App.css` | `core/theme/tokens.js` (mobile reads it; web CSS stays as is) |

### Logic extracted from components into `core/hooks/`

The big web components mix state, API calls and markup. Each one is split
into a `core/` hook (state + actions) and a thin web view that renders
what the hook returns. Mobile then reuses the hook with its own view.

| Web component | Lines | New `core/` hook | Owns |
|---|---|---|---|
| `src/App.jsx` | 270 | `useAuthSession` | restore session, verify token, login, logout, style quiz needed, clear caches |
| `components/today/viewToday.jsx` | 1366 | `useToday` | fetch with retries, sort + sort cache, tag select, next/prev, reject, mark worn + undo snapshot, delete outfit |
| `components/today/autoWeather.jsx` | 343 | `useWeather` | cached weather, Open-Meteo fetch, post to `/today/create`, season |
| `components/today/footwear/todayFootwearBox.jsx` | 434 | `useTodayFootwear` | ranking, wear / unwear / reject, cache |
| `components/clothes/addUpdateClothes.jsx` | 641 | `useSaveClothing` | two-step form, validation, upload → save → clean up image on failure |
| `components/footwear/addUpdateFootwear.jsx` | 392 | `useSaveFootwear` | same flow for footwear |
| `components/matches/createMatch.jsx` | 757 | `useCreateMatch` | load clothes by category, selection, submit |
| `components/matches/viewMatchesCard.jsx` | 691 | `useMatchCard` | edit form, tags, mark worn, favourite |
| `pages/Matches.jsx` | 326 | `useMatchesPage` | filters, paging, polling for new matches, bulk delete |
| `pages/Clothes.jsx` | 348 | `useWardrobePage` | clothes/footwear switch, type/subtype filters, paging |
| `components/general/filter.jsx` | 473 | `useFilterPanel` | draft filters, category item pickers, temperature |
| `components/preferences/weeklyPreferences.jsx` | 588 | `useWeeklyPreferences` | load/save weekly tags |
| `components/preferences/stylePreferences.jsx` | 368 | `useStylePreferences` | load/save style + pairing answers |
| `components/styleQuiz/StyleQuizForm.jsx` | 272 | `useStyleQuiz` | steps, answers, submit |
| `components/stats/stats.jsx` | 322 | `useStats` | fetch + top-N counts |
| `pages/User.jsx` (delete account) | - | `useDeleteAccount` | delete + logout |

Also tidy along the way:
- `Homepage.jsx`'s `getCurrentSeason` duplicates `getSeason` in
  `todayHelpers`, but the two disagree: `getSeason` takes latitude into
  account, `getCurrentSeason` doesn't. Pick one and keep it in
  `core/utils/dates.js`.
- Mixed `fetch`/`axios` calls all become `core/api/*` functions.

### Stays web-only

All `.css`, all JSX markup, `header.jsx`, the `ScrollToTop` component,
`@vercel/analytics` / `speed-insights`, `react-router-dom`. `Enter.jsx` (the
magic-link route) is dead code: `signIn` is a no-op, so it isn't ported.

## Mobile app

### Dependencies

Install with `npx expo install` so versions match the SDK. Everything
here runs in Expo Go, with no custom native code.

- `expo-router` (+ `react-native-screens`, `react-native-safe-area-context`)
- `expo-image`: cached images, works with the Cloudinary sizes from `getImageUrl`
- `expo-image-picker`: library **and camera**
- `expo-location`, `expo-secure-store`, `@react-native-async-storage/async-storage`
- `axios`
- Range slider: no library - `RangeSlider` in the UI kit (PanResponder,
  screen-reader adjustable), for the temperature min/max

### Structure

```
mobile/
├── src/app/                      expo-router screens (SDK 57 convention: src/app)
│   ├── _layout.jsx               boot: hydrate storage → configureCore → providers
│   ├── (auth)/login.jsx
│   ├── (auth)/register.jsx
│   ├── style-quiz.jsx            gate, like StyleQuizGate
│   ├── (tabs)/_layout.jsx        bottom tabs
│   ├── (tabs)/index.jsx          Today
│   ├── (tabs)/wardrobe.jsx
│   ├── (tabs)/outfits.jsx
│   ├── (tabs)/profile.jsx
│   ├── build-outfit.jsx          Build an outfit (stack)
│   ├── item/edit.jsx             add/edit clothing or footwear (modal)
│   └── account/weekly.jsx, style.jsx, stats.jsx   (opened from the Profile tab)
├── src/
│   ├── auth/                     SessionProvider (useAuthSession for every screen)
│   ├── platform/                 storage, location, imagePicker, config
│   ├── components/ui/            design kit (below)
│   └── components/<feature>/     today, wardrobe, outfits, profile
├── assets/                       app icon + splash (from wearable_logo)
├── app.json  eas.json  metro.config.js  jsconfig.json  .env.example
```

### Navigation

| Web | Mobile |
|---|---|
| Header nav: Home / Clothes / Matches / User | Bottom tabs: **Today** / **Wardrobe** / **Outfits** / **Profile** |
| `/` Homepage: Today block + season previews | Today tab: weather, outfit carousel, shoes, then "This season" horizontal rows for clothes and outfits with "See all" |
| `/clothes` | Wardrobe tab |
| `/matches` + `/buildmatches` | Outfits tab, with a "Build outfit" button that pushes `outfits/build` |
| `/user` sidebar (weekly / style / stats) | Profile tab: list rows → stack screens, plus Log out and Delete account |
| `/style-quiz` gate | Same gate in the root layout redirect |
| Login / Register | `(auth)` group, redirect when logged in |
| Modals (add/edit, filter, popups) | Full-screen modal for add/edit; bottom sheet (RN `Modal`, slide) for filters; native-feeling confirm dialogs |

### Design

- **Tokens** from `core/theme/tokens.js`: main `#111`, secondary `#6f6a63`,
  muted `#99938b`, border `#ddd8d0`, image background `#f1efeb`, plus the
  error/success sets.
- System font (Inter isn't bundled; the system fonts are close and need no
  font loading).
- Lots of white space, hairline borders, 12px radius cards, square image
  tiles on the light image background.
- One accent: black. Filled black for the primary button, outline for
  secondary.
- **UI kit** in `mobile/src/components/ui/`: `Screen` (safe area + scroll),
  `Button`, `Chip` (tags/seasons/colours), `Card`, `TextField`, `Sheet`,
  `ConfirmDialog`, `Toast` (replaces `messagePopup`), `RangeSlider`,
  `ImageTile`, `EmptyState`, `Loading`. Feature screens use only these, so
  restyling later means editing one folder.
- **Lists** use `FlatList` with infinite scroll: the next page loads as you
  near the bottom. This replaces web page numbers but uses the same `core`
  page cache and queries. The lists also get pull-to-refresh.
- Light mode only to start. The tokens make dark mode a later add-on.

## Feature parity checklist

Mobile is "done" when every line works.

**Account**
- [ ] Register, log in, stay logged in across app restarts, log out
- [ ] Style quiz gate on first login: style images, pairing questions, weekly tags
- [ ] Delete account

**Today**
- [ ] Location → weather (min/max/code), cached for the day; season
- [ ] Today's tag from weekly preferences; change tag
- [ ] Outfits sorted for today, next/prev, reject, mark worn (and switch worn outfit with undo), delete outfit
- [ ] Footwear suggestions for the worn outfit: wear / unwear / reject
- [ ] This season's clothes and outfits previews

**Wardrobe**
- [ ] Clothes / footwear switch, type and subtype filters, search, filter panel, paging
- [ ] Add item: choose clothing or footwear → page one (name, photo from camera or library, type) → page two (auto-filled seasons/tags/colours)
- [ ] Edit item (only changed fields), replace image, delete item
- [ ] Failed save cleans up the uploaded image

**Outfits**
- [ ] List, season filter, filter panel (incl. temperature range), search, paging
- [ ] Waiting for new matches after adding clothes (polling)
- [ ] Card: favourite, mark worn, edit tags/fields, delete
- [ ] Select mode + bulk delete
- [ ] Build an outfit manually by category

**Profile**
- [ ] Weekly preferences
- [ ] Style + pairing preferences
- [ ] Stats

## Build order

The original plan did all the web refactoring (old Phases 1-2) before any
mobile screens. It's now done **one feature at a time**, so each `core/`
hook is written once and used straight away by both apps:

> extract the hook into `core/` → switch the web view to it → click through
> that part of the web app → build the mobile screen on the same hook.

API functions in `core/api/` are added the same way: with the first code
that needs them, never ahead of time. The UI kit too: each piece comes
with the first screen that needs it. Each step ends with both apps working
and is a natural commit point.

**Already done:** prep (ESLint `core/**` override, `mobile/` ignored by
ESLint and Vercel), the Expo scaffold, and the connection check (passed on
Android, 2026-10-15).

### 1. Mobile foundation (mobile only) - done
- Storage adapter: in-memory mirror hydrated from AsyncStorage at boot,
  `token` in `expo-secure-store`. Replaces `memoryStorage`.
- Boot sequence in `src/app/_layout.jsx`: hydrate storage behind the
  splash screen, then show the app.
- `core/theme/tokens.js` and the first UI kit pieces.
- Tabs shell: Today / Wardrobe / Outfits / Profile, placeholder screens.
  The connection test screen is removed.

### 2. Shared code into `core/` (web only) - done
- Web calls `configureCore` in `src/main.jsx` (`localStorage` + the URL
  from `src/config.js`); `@core` alias in `vite.config.js`.
- Everything in "Straight moves" moves, using `storage` and `core/api`
  instead of `localStorage` and hand-built requests.
- Web components that haven't had their hook extracted yet still make
  their own axios calls. `src/platform/legacyAxiosAuth.js` adds the token
  to those (it replaced the old `axios.defaults` header). Deleted in step
  10 once nothing used it.
- Click through the whole web checklist after this step.

### 3. `useAuthSession` (web) - done
Restore session, verify token, login, logout, style quiz check. `App.jsx`,
`LoginForm` and `RegisterForm` use it and `core/api/auth`.

### 4. Mobile auth - done
Login, register, stay logged in across restarts, logout, style quiz gate
(`Stack.Protected` in the root layout). The gate leads to a placeholder
style quiz screen until step 5.

### 5. Style quiz - done
`useStyleQuiz` → web `StyleQuizForm` → mobile `style-quiz.jsx`.

### 6. Profile - done
`useStats`, `useDeleteAccount`, `useWeeklyPreferences`,
`useStylePreferences` → web views → mobile Profile tab and its stack screens.

### 7. Wardrobe - done
`useFilterPanel`, `useWardrobePage`, and one `useWardrobeItemForm` for
both clothing and footwear (the planned `useSaveClothing` /
`useSaveFootwear` were ~80% the same; `core/wardrobe/itemKinds.js` holds
the differences) → web views → mobile Wardrobe tab, filter sheet and
add/edit with camera. Mobile lists scroll forever (`useAccumulatedPages`).
The clothing "View new matches" button comes with step 8.

### 8. Outfits - done
`useMatchCard`, `useMatchesPage` → web views → mobile Outfits tab: season
chips, search, filter sheet (favourites, temperature, filter by item),
outfit editor sheet, long-press to select + bulk delete, and "View new
matches" (polling) after saving clothes.

### 9. Build an outfit - done
`useCreateMatch` → web → mobile `build-outfit.jsx` (not `outfits/build` -
that would clash with the Outfits tab's `/outfits` route), opened from a
Build button on the Outfits tab.

### 10. Today - done
`useWeather`, `useTodayFootwear`, `useToday`, and `useSeasonPreviews` (the
homepage's "this season" rows) → web → mobile Today tab (`expo-location`).
`src/platform/legacyAxiosAuth.js` is deleted: no web component makes its
own API calls or touches `localStorage` any more - all of it is in `core/`.

### 11. Polish - done
- App icon + splash: the W from the Wearable logo on white (placeholder -
  swap `mobile/assets/*` for a LovedWornSeen icon). iOS is phone-only.
- No location (refused/failed) or no forecast: `useWeather` falls back to
  the last saved forecast ("last known weather"), or makes Today ready
  anyway instead of loading forever - on web and mobile.
- First-run empty states on Wardrobe and Outfits (with Add item / Build an
  outfit), separate from "nothing matches these filters".
- A root error screen (Something went wrong / Try again) instead of a
  blank screen if a screen crashes.
- Already covered while building: loading states, pull to refresh, safe
  areas, keyboard avoiding (`Screen`), accessibility labels, camera /
  photo / location permission messages. Errors use inline `Message`s and
  native alerts, so a separate toast wasn't needed.

Optional any time: `npm run test:core` with `node --test` for the pure
utils (queries, scoring, dates), in the same style as `server/specs/`.

### 12. Build and distribute - set up, builds not run yet
`mobile/eas.json` (development / preview APK / production profiles,
remote build numbers) and the store-facing app config are done; the
server no longer sends stack traces in production. Logging in, the
builds and store submission need your accounts - the step-by-step is in
**`context/mobile-release.md`**.

### API URL for the phone
Point `EXPO_PUBLIC_API_URL` at the Vercel API. A phone can't reach
`localhost:4444`. For a local server use your PC's LAN IP
(`http://192.168.x.x:4444/api`) with phone and PC on the same Wi-Fi.

## Backend

No changes were needed for mobile. `server/index.js`'s error handler now
leaves out `err.stack` in production (step 12).

## Risks and gotchas

- **Duplicate React in Metro.** Covered by the Metro config and the
  connection check.
- **`.PNG` uppercase extensions** won't resolve in Metro. Renamed in step 2.
- **Expo Go only runs the latest SDK.** Keep `mobile/` on the SDK your
  phone's Expo Go supports (`npx expo install --fix` after upgrading).
- **Background matching** runs on the server (`waitUntil`), so closing the
  app after adding clothes is fine. Outfits use the same polling as web.
- **The refactor touches most web files.** Doing it one feature at a
  time, clicking through that part of the web after each, keeps it safe.
  Every step is a natural commit point.
- **Vercel Hobby is non-commercial.** Fine for now; revisit before monetising.

## Open choices (defaults chosen; change if you like)

- App name **LovedWornSeen**, ids `com.katag1001.lovedwornseen` (Android package / iOS bundle id) - decided. Bundle ids can't change after publishing.
- Infinite scroll on mobile instead of page numbers.
- Light mode only for the first release.

## Built so far

Steps 1-11 of the build order (12 set up). `core/` also holds everything in "Straight
moves" above.

| File | What it is |
|---|---|
| `core/config.js` | `configureCore({ apiUrl, storage, cloudName, uploadPreset })`, `getCoreConfig()`, `getStorage()` |
| `core/storageKeys.js` | Every storage key core/ uses (same names as the web always used) |
| `core/api/client.js` | Shared axios instance: base URL + Bearer token |
| `core/api/auth.js`, `errors.js`, `preferences.js`, `lists.js`, `matches.js`, `clothing.js`, `footwear.js`, `today.js`, `images.js` | API functions - only the ones something uses so far |
| `core/auth/session.js`, `styleQuizStatus.js` | Saved login; "does this user still need the style quiz" |
| `core/hooks/useAuthSession.js` | Restore / verify / login / logout / quiz status. Used by web `App.jsx` and mobile `SessionProvider` |
| `core/hooks/useStyleQuiz.js`, `useWeekTagPicker.js`, `core/styleQuiz/` | Style quiz steps, answers → preferences, pairing sections |
| `core/hooks/useWeeklyPreferences.js`, `useStylePreferences.js`, `useStats.js`, `useDeleteAccount.js`, `useFlashMessage.js`, `core/stats/topWorn.js` | Profile screens |
| `core/utils/tagOptions.js` | `getTagOption(name)` |
| `core/hooks/useWardrobePage.js`, `useFilterPanel.js`, `useWardrobeItemForm.js`, `useAccumulatedPages.js` | Wardrobe list, filter panel, add/edit form, infinite scroll |
| `core/hooks/useMatchesPage.js`, `useMatchCard.js`, `useCreateMatch.js`, `core/matches/` | Outfits list (+ new-match polling), card actions, building an outfit, field formatting |
| `core/hooks/useToday.js`, `useTodayFootwear.js`, `useWeather.js`, `useSeasonPreviews.js` | Today outfits, shoes, weather + /today/create, this season's previews |
| `core/today/` (`todayOutfitOrder`, `outfitOrderCache`, `wornSnapshot`, ...), `core/footwear/footwearOrder.js`, `core/weather/weatherText.js` | Today helpers |
| `core/wardrobe/` | `itemKinds` (clothing vs footwear), `itemValidation`, `saveWardrobeItem` (upload → save → clean up), `typeChoices`, `wardrobeTypes` |
| `core/filters/filterDefaults.js` | The filter panel's fields and item categories |
| `src/components/clothes/addUpdateItem.jsx` | The web add/edit modal for both kinds (replaces `addUpdateClothes.jsx` and `addUpdateFootwear.jsx`) |
| `core/theme/tokens.js` | Colours, font sizes, spacing, radii for mobile |
| `src/main.jsx` | Web calls `configureCore` (localStorage, `src/config.js` URL, `VITE_*` Cloudinary) |
| `vite.config.js` | `@core` alias |
| `mobile/src/platform/storage.js`, `useStorageReady.js` | Sync storage mirror: AsyncStorage + SecureStore (token), loaded behind the splash |
| `mobile/src/platform/config.js` | `EXPO_PUBLIC_API_URL`, defaulting to the Vercel API |
| `mobile/src/auth/SessionProvider.jsx` | `useSession()` for every screen |
| `mobile/src/app/_layout.jsx` | Boot (splash → storage → session) and the `Stack.Protected` gates |
| `mobile/src/app/(auth)/login.jsx`, `register.jsx` | Log in / register |
| `mobile/src/app/style-quiz.jsx`, `mobile/src/components/styleQuiz/` | The style quiz gate |
| `mobile/src/app/(tabs)/` | Bottom tabs. Today / Wardrobe / Outfits are placeholders; Profile lists the account screens, Log out and Delete account (native confirm alerts) |
| `mobile/src/app/account/` | Weekly preferences, Style preferences, Stats (stack screens with a back button) |
| `mobile/src/components/week/WeekDayRow.jsx` | The seven-day picker (quiz + weekly preferences) |
| `mobile/src/app/(tabs)/wardrobe.jsx`, `mobile/src/components/wardrobe/` | Wardrobe grid (type chips, search, pull to refresh, infinite scroll) |
| `mobile/src/app/item/edit.jsx` | Add / edit / delete an item (modal). Photo from camera or library |
| `mobile/src/components/filters/` | Filter bottom sheet (all sections, incl. filter by item) |
| `mobile/src/app/(tabs)/outfits.jsx`, `mobile/src/components/outfits/` | Outfits list, card, editor sheet, selection bar |
| `mobile/src/app/build-outfit.jsx` | Build an outfit by hand |
| `mobile/src/app/(tabs)/index.jsx`, `mobile/src/components/today/` | Today tab: weather, outfit picker, worn outfit + shoes, this season |
| `mobile/src/platform/useLocation.js` | One rough location fix for the weather (permission handled) |
| `mobile/src/platform/imagePicker.js` | Camera / library with permission handling |
| `mobile/.env` (not committed) | Cloudinary cloud name + upload preset, copied from the web's `VITE_*` values |
| `mobile/src/components/ui/` | `Screen`, `Button`, `TextField`, `Message`, `Loading`, `EmptyState`, `ChoiceCard`, `ImageTile`, `TagTile`, `Grid`, `Card`, `ListRow`, `SectionTitle`, `SegmentedControl`, `Chip`, `ChipRow`, `Sheet`, `RangeSlider` |
| `mobile/metro.config.js` | Resolution of `core/` and `shared/` (see above) |
| `mobile/.env.example` | API URL options (deployed / local LAN IP) |
| `mobile/AGENTS.md`, `mobile/.claude/` | From the Expo template: guidance for AI coding tools on SDK changes |
| `.vercelignore` | Keeps `mobile/` out of Vercel deploys |
| `mobile/eas.json`, `context/mobile-release.md` | EAS build profiles; how to build and release |
| `mobile/assets/` | Icon, adaptive icon, splash (generated from `core/assets/wearable_logo.png`) |

Small behaviour changes on the web:
- Login now saves the user's email (it used to save `"undefined"`, so
  the per-user Today caches were keyed on that).
- Restoring a session only logs out if the server rejects the token. If
  the server can't be reached, the saved login is kept.
- `/today/create` failing with an error status is now retried on the next
  load. It used to be marked as done for the day anyway.
- A failed clothing save now shows its error in the form (it used to
  show nothing; footwear already did).
- Today: a failed "Mark as worn" now shows an error (it used to fail
  silently), and the "today is still being made" retries stop when you
  leave the page.

Run the mobile app with `cd mobile` → `npx expo start` → scan the QR code
with Expo Go.
