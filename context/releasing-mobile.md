# Releasing the mobile app

How changes get from the code to the app on the phone. The app is an
Android **preview** build (an APK installed straight from Expo, not the
Play Store), made with EAS Build and updated over the air with EAS Update.

## The three ways code goes out

| What you do | What it changes |
| --- | --- |
| `git push` | GitHub only. **The phone never sees it.** Vercel redeploys the server from it. |
| `eas update` | The app on the phone, over the air (JavaScript-only changes). |
| `eas build` | A whole new APK to install (native changes). |

## Everyday changes: send an update (no rebuild)

Screens, styles, logic, text, images used in screens - anything in
JavaScript.

1. Commit the changes.
2. From `mobile/` run:

   ```
   npx eas-cli@latest update --channel preview --environment preview --platform android --message "What changed" --non-interactive
   ```

   Always include `--platform android`: without it, it also tries to build
   for web and fails (react-native-web isn't installed).
3. On the phone: open the app, close it fully, open it again. The first
   open downloads the update in the background; the second runs it.

Updates only reach builds with the same runtime version, which is the
app's `version` in `app.json` (currently `1.0.0`).

## When a new build is needed

Only when something native changes:

- adding or upgrading a package with native code (camera, maps, etc. -
  `npx expo install` packages usually are), or an Expo SDK upgrade
- changing `app.json`: icon, splash screen, permissions, plugins, name,
  `version`

From `mobile/`, after committing:

```
npx eas-cli@latest build -p android --profile preview --non-interactive --no-wait
```

It queues on Expo's servers (can take a while on the free plan). When
it's finished, open the build's page on the phone (or scan its QR code),
tap **Install**, and allow installs from the browser if Android asks.
It installs over the existing app (same signing key, kept on Expo).

## Environment variables

- **Expo (EAS, `preview` environment)**: only the public ones the app
  needs - `EXPO_PUBLIC_CLOUD_NAME` and `EXPO_PUBLIC_UPLOAD_PRESET`
  (Cloudinary unsigned uploads). The builds and updates load them
  automatically.
- **Vercel**: all the secrets - Mongo, JWT, Gemini (`GEMINI_API_KEY`,
  `GEMINI_MODEL`), Cloudinary. Never put these in Expo; the app talks to
  the Vercel API, which uses them.
- In development (Expo Go), the app uses the local server on port 4444,
  not Vercel.

## Links

- Project on Expo: https://expo.dev/accounts/kahg1001s-team/projects/loved-worn-seen
- Current build (SDK 58, 2026-11-03): https://expo.dev/accounts/kahg1001s-team/projects/loved-worn-seen/builds/b651abf6-4ac0-4c8b-a619-f828874191e5

## Gotchas we've hit

- **"Unmatched route" on a fresh install**: the app opens at `/` (Today),
  which is hidden while logged out. Fixed by `redirectTo` on the
  `Stack.Protected` in `mobile/src/app/_layout.jsx` (logged out -> Log in).
  In Expo Go you're usually logged in, so test logged-out launches on a
  real build too.
- **Duplicate permissions in `app.json`**: `expo update:configure` added
  them a second time; check `app.json` after running it.
