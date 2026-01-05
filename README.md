# Wardrobe Builder — Outfit Matcher & Weather-Aware Suggestions

## Short description

**What it does:** Wearable is a personal wardrobe management and outfit recommendation app. Users add clothing items and the app matches outfits using an algorithm that considers color, print, season, and the temperature, storing results in a matches database and delivering ranked outfit suggestions.


## Features ✅

- Add, update, and delete clothing items (with images and attributes like color, print, season, and type)
- Automatic matching algorithm that pairs items based on color harmony, print compatibility, season, and temperature
- Weather-aware outfit suggestions using a backend API to pull the daily temperature
- Ranked recommendations that prefer items not recently recommended
- Matches persisted in a server-side database for review and reuse
- User authentication (register / login) and user-specific wardrobes
- Simple React + Vite frontend and Node.js backend (Express) API

---

## Project structure 🔧

Top-level layout (important files/folders):

- `package.json` — project scripts and dependencies
- `vite.config.js` — dev/build config for the frontend

- `api/` — backend server and API endpoints
  - `api/index.js` — server entry point
  - `api/controllers/` — request handlers
  - `api/routes/` — routers 
  - `api/models/` — data models
  - `api/services/` — match algorithm

- `src/` — React application source
  - `src/components/` — UI components (LoginForm, RegisterForm, clothes CRUD, match views, Today/autoWeather components)

  - `src/pages/` — routed pages (Homepage, Clothes, Matches, TodayOutfits, User pages)

  - `src/PullWeather.jsx` & `src/components/today/autoWeather.jsx` — logic to fetch and use daily temperature

  - `src/constants/` & `src/utils/` — app constants and helper utilities (e.g., color palettes, match scoring)

- `public/` — static assets and images


## Development & running locally 🛠️

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the frontend dev server:

   ```bash
   npm run dev
   ```

3. Start the backend API (runs `nodemon ./api/index.js`):

   ```bash
   npm start
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Lint the code:

   ```bash
   npm run lint
   ```

Note: the API may require environment variables (e.g., weather API key, Cloudinary credentials, JWT secret). Configure these before running the backend.

---
