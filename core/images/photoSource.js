// core/images/photoSource.js
//
// Where the app loads an item photo from. Each photo is stored in two
// sizes (shared/photoSizes.json); this picks the right one for the size
// it's shown at.
//
// While testing, photos come from our own server, only to their owner
// (the login token goes with the request): GET /api/images/file. Before
// launch this switches to a Cloudflare Worker on our own domain
// (context/before-launch.md) - only this file changes.

import photoSizes from "../../shared/photoSizes.json";

import { getCoreConfig } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";

// The stored size for a photo shown `wanted` pixels wide (at 2-3x).
const storedSize = (wanted) => (wanted <= 400 ? photoSizes.small : photoSizes.large);

// The photo's address, or null without one.
export const photoUrl = (imageKey, wanted = photoSizes.large) =>
  imageKey
    ? `${getCoreConfig().apiUrl}/images/file?key=${encodeURIComponent(`${imageKey}-${storedSize(wanted)}.webp`)}`
    : null;

// An image source for React Native / expo-image: { uri, headers }, or null
// without a photo.
export const photoSource = (imageKey, wanted) => {
  const uri = photoUrl(imageKey, wanted);

  if (!uri) return null;

  const { storage } = getCoreConfig();
  const token = storage.getItem(STORAGE_KEYS.token);

  return token ? { uri, headers: { Authorization: `Bearer ${token}` } } : { uri };
};
