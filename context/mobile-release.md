# Building and releasing LovedWornSeen

How to turn `mobile/` into installable apps with EAS (Expo's cloud build
service) and get them into the stores. Build step 12 of
`context/mobile-app-plan.md`.

Everything here runs from `mobile/`. `npx eas-cli@latest` is the EAS CLI
(no global install needed). Commands that need your Expo account are
interactive - run them yourself (in Claude Code, prefix with `!`).

## What's already set up

| Where | What |
|---|---|
| `mobile/app.json` | Name **LovedWornSeen**, Android package / iOS bundle id `com.katag1001.lovedwornseen`, version `1.0.0`, icon + splash (the W from the Wearable logo - replace `mobile/assets/*` for a different icon), phone only on iOS (no iPad screenshots needed), permission texts for camera, photos and location |
| `mobile/eas.json` | Profiles `development` (only needed if a library that isn't in Expo Go is ever added - also needs `npx expo install expo-dev-client`), `preview` (Android APK to install directly), `production` (store builds; build numbers count up by themselves - `appVersionSource: remote`) |
| `server/index.js` | Error responses no longer include stack traces in production (deploy the server for this to take effect) |
| Monorepo | EAS uploads the whole git repo (`.gitignore`d files left out), so `core/` and `shared/` next to `mobile/` are included; `mobile/metro.config.js` resolves them as in development |

## 1. One-off setup

```sh
cd mobile
npx eas-cli@latest login          # free Expo account: https://expo.dev/signup
npx eas-cli@latest init           # links the project; adds extra.eas.projectId to app.json - commit that
```

The build machines don't get `mobile/.env` (it's not committed), so give
EAS the Cloudinary values - the same as `EXPO_PUBLIC_CLOUD_NAME` /
`EXPO_PUBLIC_UPLOAD_PRESET` in `mobile/.env`. They're public values (they
end up inside the app), hence `plaintext`. Once per environment:

```sh
npx eas-cli@latest env:set --name EXPO_PUBLIC_CLOUD_NAME --value <from mobile/.env> --environment preview --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_UPLOAD_PRESET --value <from mobile/.env> --environment preview --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_CLOUD_NAME --value <from mobile/.env> --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_UPLOAD_PRESET --value <from mobile/.env> --environment production --visibility plaintext
npx eas-cli@latest env:list --environment production   # check
```

`EXPO_PUBLIC_API_URL` isn't needed: the app defaults to the Vercel API.

## 2. An Android build for your own phone (free)

```sh
npx eas-cli@latest build -p android --profile preview
```

The first time, let EAS create the Android signing key ("Generate a new
keystore" - it keeps it safe for you). When the build finishes, open the
link on your phone and install the APK (allow installs from your browser
when Android asks). Share the same link with testers.

The free plan has a monthly build allowance and a queue - a build can wait
a while before it starts.

## 3. iOS

- **Before paying anything:** the app already runs on any iPhone in Expo Go
  (`npx expo start --tunnel`, scan with the iPhone camera).
- **TestFlight / App Store:** needs the Apple Developer Program ($99/year).
  Then:

```sh
npx eas-cli@latest build -p ios --profile production     # EAS sets up certificates
npx eas-cli@latest submit -p ios --latest                # uploads to App Store Connect -> TestFlight
```

## 4. Google Play

- Google Play developer account: $25 one-off. New personal accounts must
  run a closed test with a group of testers for a couple of weeks before
  the first production release (at the time of writing, 12 testers for 14
  days - the Play Console shows the current rule).
- The first upload of an app has to be done by hand in the Play Console:

```sh
npx eas-cli@latest build -p android --profile production   # .aab for the store
```

  Download the `.aab` from the build page and upload it to a testing track
  in the Play Console. After that, `npx eas-cli@latest submit -p android
  --latest` can upload new versions (it needs a Google service account key
  - EAS walks you through it).

## 5. What both stores ask for

- **A privacy policy URL.** The app stores: account email + password hash,
  clothes photos (Cloudinary), wardrobe/outfit data, style preferences; it
  uses location (weather only, not stored on the server beyond today's
  temperatures) and the camera/photos (only when adding an item). A page on
  the Vercel site is enough.
- **Account deletion** - already in Profile → Delete account.
- **Screenshots** (phone sizes) and a short description.
- **Data safety / privacy forms** - answer from the list above.

## 6. After release

JavaScript-only fixes can go out without a store review, with EAS Update:

```sh
npx expo install expo-updates
npx eas-cli@latest update:configure
npx eas-cli@latest update --channel production --message "Fix ..."
```

(Set this up before the first store build if you want it - builds made
before `expo-updates` was added can't receive updates.) Anything that
adds a native library, or changes `app.json`, needs a new build.
