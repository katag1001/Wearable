// mobile/src/platform/config.js
//
// EXPO_PUBLIC_* values are baked into the bundle at build time (they're
// public - never put secrets here). Set them in mobile/.env for local
// development; see .env.example.

const DEFAULT_API_URL = "https://wearable-psi.vercel.app/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

// The Cloudinary account item photos upload to.
export const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUD_NAME;
export const UPLOAD_PRESET = process.env.EXPO_PUBLIC_UPLOAD_PRESET;
