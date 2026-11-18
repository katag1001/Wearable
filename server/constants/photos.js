// server/constants/photos.js
//
// Item photos (context/cloudflare-migration-plan.md): stored privately in
// Cloudflare R2 (services/storage/r2Storage.js), two WebP sizes each,
// backgrounds removed on the phone or, when it can't, by our Cloudflare
// Worker (workers/cutout).

const photoSizes = require("../../shared/photoSizes.json");

module.exports = {
  // Every photo is stored in these sizes (px, the longest side), shared
  // with the app (core/images/photoSource.js picks one): "<key>-900.webp"
  // for the item page, "<key>-300.webp" for grids and outfits.
  PHOTO_SIZES: [photoSizes.large, photoSizes.small],
  WEBP_QUALITY: 80,

  // What the phone may upload, and as which file ending.
  UPLOAD_TYPES: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  },

  // Uploads bigger than this are refused (the phone shrinks photos to
  // 1600 px first, so a real one is ~0.5 MB).
  MAX_UPLOAD_BYTES: 15 * 1024 * 1024,

  // How long a signed upload link works.
  UPLOAD_LINK_SECONDS: 5 * 60,

  // Give up on the Cloudflare background removal after this long.
  CUTOUT_TIMEOUT_MS: 30 * 1000,

  // A pixel this transparent (0-255) or more doesn't count as garment when
  // trimming a cut-out to its edges.
  TRIM_THRESHOLD: 10,

  // How long the phone may keep a photo it was sent (they never change:
  // a new photo gets a new key).
  PHOTO_CACHE_SECONDS: 365 * 24 * 60 * 60,
};
