// server/services/backgroundRemovalService.js
//
// Removes the background from a newly uploaded item photo, before it's
// sent to Gemini (controllers/analysisControllers.js). Cloudinary removes
// the background and trims the empty space; the result is saved as its own
// image ("<id>_nobg", a transparent WebP) with a thumbnail ("<id>_thumb").
// The photo as uploaded stays as it is, as the item's original.
//
// The numbers are in constants/backgroundRemoval.js. Nothing is saved on
// an item here: the item fields come back to the app, which saves them
// with the item (or deletes the images if it never does).

const cloudinary = require("../cloudinary.js");
const {
  FULL_SIZE,
  THUMBNAIL_SIZE,
  BACKGROUND_REMOVED_SUFFIX,
  THUMBNAIL_SUFFIX,
  POLL_MS,
  MAX_WAIT_MS,
} = require("../constants/backgroundRemoval.js");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const backgroundRemovedUrl = (publicId) =>
  cloudinary.url(publicId, {
    secure: true,
    format: "webp",
    transformation: [
      { effect: "background_removal" },
      { effect: "trim" },
      { width: FULL_SIZE, height: FULL_SIZE, crop: "limit", quality: "auto" },
    ],
  });

const thumbnailUrl = (publicId) =>
  cloudinary.url(publicId, {
    secure: true,
    format: "webp",
    transformation: [{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, crop: "limit", quality: "auto" }],
  });

// Waits until Cloudinary has made the image at `url` (423 = still working).
async function waitForImage(url) {
  const giveUpAt = Date.now() + MAX_WAIT_MS;

  for (;;) {
    const response = await fetch(url, { method: "HEAD" });

    if (response.ok) return;

    if (response.status !== 423) {
      throw new Error(`Cloudinary answered ${response.status}`);
    }

    if (Date.now() + POLL_MS > giveUpAt) {
      throw new Error("timed out waiting for the background to be removed");
    }

    await sleep(POLL_MS);
  }
}

// Saves the image at `url` as its own Cloudinary image.
const saveAsImage = (url, publicId) =>
  cloudinary.uploader.upload(url, { public_id: publicId, overwrite: true, resource_type: "image" });

// The original's id, if `cloudinaryId` is a background-removed image.
const originalIdOf = (cloudinaryId) =>
  typeof cloudinaryId === "string" && cloudinaryId.endsWith(BACKGROUND_REMOVED_SUFFIX)
    ? cloudinaryId.slice(0, -BACKGROUND_REMOVED_SUFFIX.length)
    : null;

// The item fields for a background-removed image's thumbnail and original,
// worked out from its id - so the app only ever sends imageUrl and
// cloudinaryId. {} for any other image.
function derivedImageFields(cloudinaryId) {
  const originalId = originalIdOf(cloudinaryId);

  if (!originalId) return {};

  const thumbnailId = `${originalId}${THUMBNAIL_SUFFIX}`;

  return {
    thumbnailUrl: cloudinary.url(thumbnailId, { secure: true, format: "webp" }),
    thumbnailCloudinaryId: thumbnailId,
    originalImageUrl: cloudinary.url(originalId, { secure: true }),
    originalCloudinaryId: originalId,
  };
}

// Removes the background from the uploaded photo `publicId`. Returns the
// new image as item fields { imageUrl, cloudinaryId } plus every image id
// it made (`createdIds`, for deleting them if the item is never saved).
// Throws if Cloudinary can't do it.
async function removeBackground(publicId) {
  const removedUrl = backgroundRemovedUrl(publicId);

  await waitForImage(removedUrl);

  const full = await saveAsImage(removedUrl, `${publicId}${BACKGROUND_REMOVED_SUFFIX}`);
  const thumbnail = await saveAsImage(thumbnailUrl(full.public_id), `${publicId}${THUMBNAIL_SUFFIX}`);

  return {
    imageUrl: full.secure_url,
    cloudinaryId: full.public_id,
    createdIds: [full.public_id, thumbnail.public_id],
  };
}

module.exports = { removeBackground, derivedImageFields };
