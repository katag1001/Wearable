# Wearable / LovedWornSeen

A wardrobe app that turns your clothes into outfits and suggests what to
wear today. Photograph an item and AI fills in its details and removes the
background; the server builds and scores every outfit it can make; each
morning the Today page ranks the best ones for your weather, week and
history. Everything you do - favouriting, building, rejecting, "too cold",
"these two don't go" - feeds back into future suggestions.

Two front ends share one API:

- **Wearable** - the website (Vite + React), on Vercel.
- **LovedWornSeen** - the iOS / Android app (Expo + React Native), built
  with EAS.

## Features

- **Add from a photo** - Cloudinary removes the background, Google Gemini
  names the item and picks its type, colours, pattern, fabric and tags
  (200 analyses per user per day). Or add by hand.
- **Clothing and footwear** wardrobes with search, filters and favourites.
- **Automatic outfits** - every valid combination is found and scored
  (fixed compatibility grids per gender, layering, colour palettes,
  pattern and tag rules, learned taste), with a temperature range worked
  out from the subtypes.
- **Build your own outfits** - no rules; they also teach the app your taste.
- **Today** - built once a day on the server from the day's weather
  (Open-Meteo), your weekday tag, season, freshness and scores. Swipe
  through, pick shoes, mark as worn; the broken heart covers too hot / too
  cold / mismatch / not with tights.
- **Style quiz** - gender, colour and pattern levels, favourite palettes,
  pairing questions, weekday tags, running hot or cold, seasonality.
- **Stats** - most-worn outfits and clothes.

## How it fits together

```
 web (src/)        mobile (mobile/)
      \               /
       core/  shared/          client logic + shared JSON data
            |
   Express API (server/)  ── one Vercel serverless function (api/)
      |        |        |
  MongoDB  Cloudinary  Gemini        clients call Open-Meteo directly
```

| Folder | What |
|---|---|
| `server/` | Express API: routes, controllers, Mongoose models, matching / scoring / Today services, specs, DB scripts |
| `api/` | Vercel entry point for the server |
| `src/` | Web UI only |
| `mobile/` | Expo app, mobile UI only |
| `core/` | Client logic shared by web and mobile: API calls, caches, screen hooks, weather, footwear ranking. No DOM or React Native code |
| `shared/` | JSON data used by the server and both apps (colours, palettes, subtypes, footwear scoring, tights...) |
| `context/` | Design and behaviour docs - start here |

### External services

| Service | Used for |
|---|---|
| MongoDB | All data |
| Vercel | Hosting the website and the API (+ Analytics / Speed Insights on the web) |
| Cloudinary | Image storage, background removal, thumbnails |
| Google Gemini (`gemini-3.5-flash-lite`) | Photo analysis |
| Open-Meteo | Today's weather (called from the apps, no key) |
| Expo / EAS | Building and releasing the mobile app |

## Running locally

```bash
npm install
npm start            # API on http://localhost:4444 (nodemon server/index.js)
npm run dev          # website (Vite)
npm run test:server  # server specs (node --test)
npm run lint

cd mobile
npm install
npx expo start       # mobile app in Expo Go
```

### Environment variables

| Where | Variables |
|---|---|
| `server/.env` (Vercel env vars when deployed) | `MONGO`, `JWT_SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`, `GEMINI_API_KEY`, optional `GEMINI_MODEL` |
| `.env` (web) | `VITE_CLOUD_NAME`, `VITE_UPLOAD_PRESET` |
| `mobile/.env` | `EXPO_PUBLIC_CLOUD_NAME`, `EXPO_PUBLIC_UPLOAD_PRESET`, optional `EXPO_PUBLIC_API_URL` (defaults to the Vercel API) |

## Docs

| Doc | Covers |
|---|---|
| `context/clothing-and-matching-flow.md` | Adding items, matching, scoring, learning, the Today page |
| `context/temperature-ranges.md` | How outfit temperature ranges and tights work |
| `context/footwear.md` | Footwear and shoe suggestions |
| `context/adding-a-subtype.md` | Adding / renaming a subtype |
| `context/mobile-app-plan.md` | Mobile app structure and the shared `core/` |
| `context/mobile-release.md` | Building and releasing with EAS |
| `context/visual-language.md` | The mobile app's soft visual language |
| `context/background-removal-research.md` | Background removal |

## Database scripts

- `server/scripts/rematchAll.js` - rebuilds every outfit you haven't
  interacted with, using the current rules.
- `server/scripts/resetToday.js` - rebuilds today's lists.
- `server/scripts/evaluateItemAnalysis.js` - scores Gemini against a
  hand-checked set of items (reports in `server/scripts/reports/`).
