// mobile/src/platform/config.js
//
// EXPO_PUBLIC_* values are baked into the bundle at build time (they're
// public - never put secrets here). Set them in mobile/.env for local
// development; see .env.example.
//
// The API:
//  - Development (Expo Go, `npx expo start`): always the server running on
//    this computer (npm start at the repo root, port LOCAL_API_PORT). Its
//    address is the one the phone loaded the app from (Expo's hostUri), so
//    it follows the computer's Wi-Fi IP without editing anything. Never the
//    deployed API.
//  - Release builds: EXPO_PUBLIC_API_URL, or the deployed API.

import Constants from "expo-constants";

const DEFAULT_API_URL = "https://wearable-psi.vercel.app/api";
const LOCAL_API_PORT = 4444;

// "192.168.1.50:8081" -> "192.168.1.50". Missing (or a tunnel's
// *.exp.direct address, which can't reach port 4444) gives localhost, so
// requests fail loudly instead of reaching the deployed API.
const devMachineHost = () => {
  const host = Constants.expoConfig?.hostUri?.split(":")[0];

  if (!host || host.endsWith(".exp.direct")) {
    console.warn(
      "Couldn't find this computer's address - start Expo on LAN (not tunnel) to reach the local API."
    );
    return "localhost";
  }

  return host;
};

export const API_URL = __DEV__
  ? `http://${devMachineHost()}:${LOCAL_API_PORT}/api`
  : process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

// The Cloudinary account item photos upload to.
export const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUD_NAME;
export const UPLOAD_PRESET = process.env.EXPO_PUBLIC_UPLOAD_PRESET;
