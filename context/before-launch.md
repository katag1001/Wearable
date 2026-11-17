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
      paragraph at the bottom of Profile (`profile.jsx`). The web's Today
      line (`src/components/today/autoWeather.jsx`) can stay until the web
      goes offline.

## Check

- [ ] **NASA POWER's licence for a paid app.** The Plan tab's typical
      weather comes from NASA POWER. Their pages ask for a citation (it's in
      the app: Profile, and the Plan day weather card) but don't state a
      licence. NASA's data is generally free to use; confirm with them
      (larc-power-project@mail.nasa.gov) before launch.
- [ ] **Subscribe to MET Norway's changes**, so you hear when their API
      changes or a version is retired (usually a month's notice): the feed
      `https://api.met.no/feed/changelog` or their api-users mailing list.

## Deploying the weather change (built 2026-11-17, not deployed yet)

The forecast now comes from MET Norway and the typical weather from NASA
POWER, both through our server (`server/services/weatherService.js`); the
apps no longer call a weather service themselves. Weather is free (it was
$29 a month). In this order:

1. **Set `MET_CONTACT`** in Vercel → the project → Settings → Environment
   Variables (Production and Preview), to the contact email. Without it the
   server won't call MET Norway (they ban requests that don't say who's
   calling), so the weather would be unavailable.
2. **Commit and push `main`.** Vercel deploys the server and the web app;
   the web app uses the new weather straight away. The server creates a
   small `weathercaches` collection in MongoDB by itself (entries delete
   themselves).
3. **Send the phone an update** (JavaScript only, no new build). From
   `mobile/`:
   ```
   npx eas-cli@latest update --channel preview --environment preview --platform android --message "Weather from MET Norway via the server"
   ```
   Until then the installed app keeps using the old weather service
   directly, which still works.
4. **Check:** Today and the Plan tab show sensible temperatures and icons;
   Profile shows the weather credits; Vercel logs show few calls to MET
   Norway and no "refused" or "203" warnings.

Merging the phone cut-out branch later (`phone-cutout`): both it and
`main` changed `context/cost-plan.md` and `context/cost-plan.html`. If git
reports a conflict there, keep `main`'s versions (they're newer).

## Also waiting

- **Phone cut-out** (on the branch `phone-cutout`): built, not deployed.
  Steps in `context/phone-cutout-plan.md` on that branch, "Deploying it
  later".
- **iPhone:** nothing has run on an iPhone yet (needs the Apple developer
  account). Includes the cut-out's iPhone half.
