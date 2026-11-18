# Before launch

Things that must be done before the app goes out to real users. Add to it
as you go; tick things off when they're done.

## Must change

- [ ] **MET Norway contact email.** Every weather request tells MET Norway
      who's calling, with a contact. For now it's a personal email,
      **katarinag1001@gmail.com**. Change it to a non-personal address
      (e.g. a support@ address for the app), which MET Norway prefers.
      It's one setting, not code: `MET_CONTACT` in Vercel's environment
      variables (Production and Preview), and in `server/.env` for running
      locally.

## Must take out

- [ ] **The "background removed by Cloudflare" notice.** While testing, the
      app tells you whenever a photo's background was removed by Cloudflare
      instead of on the phone (`context/cloudflare-migration-plan.md`). It's
      one on/off setting in the phone app: `SHOW_CLOUDFLARE_CUTOUT_NOTICE`
      in `mobile/src/platform/garmentCutout.js` (with `registerCutoutNotice`,
      called in `mobile/src/app/_layout.jsx`, and `core/images/cutoutNotice.js`).
      Remove it before launch so users never see it, and remove its entry
      from the plan's docs.

## Must build

- [ ] **Private image serving on Cloudflare** (replaces the testing setup).
      While testing, item photos stay private by going through our own
      server (a logged-in request to `/api/images/...`, which reads them from
      the private R2 bucket): free, but every photo view is a server call,
      which gets slow and costly with real users. Before launch:
      - **Buy a domain** and put it on Cloudflare (~$10 a year).
      - **Take the Workers Paid plan** ($5 a month, includes 10 million
        requests).
      - **Build a Worker on `images.<your domain>`** that serves photos from
        the private bucket only with a signature from our server that
        expires (e.g. after a week), with caching, so copied links stop
        working and viewing never touches our server.
      - Switch the app's image links to it (one place:
        `core/utils/getImageUrl.js` / the image source helper) and remove
        the server's `/api/images` route.

## Must add

- [ ] **An "About & legal" screen** in the app, opened from a row in
      Profile. It should hold:
      - **Data credits.** MET Norway: "Based on data from MET Norway", with a
        link to the CC BY 4.0 licence
        (https://creativecommons.org/licenses/by/4.0/). We change their data
        (daily highs/lows and weather codes are worked out from their hourly
        forecast), so "based on". NASA POWER: "The data was obtained from the
        National Aeronautics and Space Administration (NASA) Langley Research
        Center's Prediction Of Worldwide Energy Resources (POWER) project
        funded through the NASA Earth Science Division."
      - **The privacy policy.** Needed for the app stores anyway. It should
        say that the phone sends its location to our server for the weather,
        and that our server, not the phone, asks MET Norway and NASA POWER,
        so they never see the user.
      - Later: terms of use, open-source licences.

      Both sources accept credits on a separate page as long as it's easy to
      find from inside the app (not only on a website). Once the screen
      exists, remove the temporary credits: the source line on the Plan tab's
      weather card (`mobile/src/components/plan/DayWeatherCard.jsx`,
      `dayWeatherSource` in `core/plan/dayWeather.js`) and the credits
      paragraph at the bottom of Profile (`profile.jsx`). (The website no
      longer shows weather: it's a "Coming soon" page.)

## Check

- [ ] **NASA POWER's licence for a paid app.** The Plan tab's typical
      weather comes from NASA POWER. Their pages ask for a citation (it's in
      the app: Profile, and the Plan day weather card) but don't state a
      licence. NASA's data is generally free to use; confirm with them
      (larc-power-project@mail.nasa.gov) before launch.
- [ ] **Subscribe to MET Norway's changes**, so you hear when their API
      changes or a version is retired (usually a month's notice): the feed
      `https://api.met.no/feed/changelog` or their api-users mailing list.

## Deploying the test version (weather + Cloudflare photos, 2026-11-18)

Everything built so far goes out together: the weather from MET Norway /
NASA POWER, Cloudflare instead of Cloudinary, the website as "Coming soon",
typed-DELETE account deletion. All of it runs on free plans. Pushing
`main` makes Vercel deploy the server straight away, so the Vercel
settings go in FIRST.

1. **Vercel settings.** vercel.com → the project → Settings → Environment
   Variables. Add each of these (tick Production and Preview), copying the
   values from `server/.env`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `CUTOUT_WORKER_URL`,
   `CUTOUT_WORKER_KEY`, and `MET_CONTACT` if it isn't there yet. Delete
   `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`.
2. **Commit and push `main`.** Vercel deploys. Check the deployment is
   "Ready"; the website shows "Coming soon".
3. **New phone build** (new native package, so an update isn't enough;
   app version 1.2.0). From `mobile/`:
   ```
   npx eas-cli@latest build -p android --profile preview
   ```
   Install the APK from the link it gives, over the old test app.
4. **Sign up** in the app, then make the account admin from the project
   root: `node server/scripts/setAdmin.js <email> --confirm`.
5. **Check:** add an item from a photo (cut out, analysed, saved, shown in
   the wardrobe and on Today), change an item's photo, delete an item;
   Today and Plan show weather; Profile → Delete account needs DELETE typed.

Later JavaScript-only changes go to this build with
`npx eas-cli@latest update --channel preview --environment preview --platform android --message "..."`.

## Also waiting

- **iPhone:** nothing has run on an iPhone yet (needs the Apple developer
  account). Includes the cut-out's iPhone half.
