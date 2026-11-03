// server/constants/backgroundRemoval.js
//
// Removing the background from a new item photo before it's analysed
// (services/backgroundRemovalService.js). The same recipe the existing
// photos went through on 2 November 2026: Cloudinary removes the
// background (75 transformations each) and trims the empty space, and the
// result is saved as its own transparent WebP plus a small thumbnail. The
// photo as uploaded is kept as the item's original.

// The background-removed image is at most this many pixels a side.
const FULL_SIZE = 1200;

// The thumbnail, at most this many pixels a side.
const THUMBNAIL_SIZE = 300;

// The saved images' public ids: the uploaded photo's id plus these.
// "_nobg" also tells the web app to pad the image (sharedComponents.css).
const BACKGROUND_REMOVED_SUFFIX = "_nobg";
const THUMBNAIL_SUFFIX = "_thumb";

// Cloudinary answers 423 while it's still removing the background: ask
// again every POLL_MS, for up to MAX_WAIT_MS before analysing the photo as
// it was uploaded instead.
const POLL_MS = 2000;
const MAX_WAIT_MS = 45000;

module.exports = {
  FULL_SIZE,
  THUMBNAIL_SIZE,
  BACKGROUND_REMOVED_SUFFIX,
  THUMBNAIL_SUFFIX,
  POLL_MS,
  MAX_WAIT_MS,
};
