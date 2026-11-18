// server/services/photoService.js
//
// Turning an upload into an item photo (context/cloudflare-migration-plan.md):
//
//   the phone uploads one file (a signed link: controllers/imagesControllers.js)
//   → if the phone couldn't cut it out, our Cloudflare Worker removes the
//     background (workers/cutout)
//   → the garment is trimmed to its edges (cut-outs only)
//   → 900 px and 300 px WebP sizes are stored under a new image key
//   → the upload is deleted.
//
// `background` (services/phoneCutoutService.js): "phone" (already cut
// out), "remove" (Cloudflare does it), "none" (keep the photo as taken).
// When Cloudflare fails, the photo is kept as taken: a photo is never
// refused because its background couldn't be removed.

const sharp = require("sharp");

const r2 = require("./storage/r2Storage.js");
const { newPhotoKey, photoFiles, userPrefix } = require("./photoKeys.js");
const {
  CUTOUT_TIMEOUT_MS,
  MAX_UPLOAD_BYTES,
  PHOTO_SIZES,
  TRIM_THRESHOLD,
  WEBP_QUALITY,
} = require("../constants/photos.js");

class PhotoError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// The cut-out from our Cloudflare Worker. Throws if it can't.
async function cloudflareCutout(uploadKey) {
  const { CUTOUT_WORKER_URL, CUTOUT_WORKER_KEY } = process.env;

  if (!CUTOUT_WORKER_URL || !CUTOUT_WORKER_KEY) {
    throw new Error("CUTOUT_WORKER_URL / CUTOUT_WORKER_KEY aren't set");
  }

  const response = await fetch(`${CUTOUT_WORKER_URL.replace(/\/+$/, "")}/cutout?key=${encodeURIComponent(uploadKey)}`, {
    method: "POST",
    headers: { "x-cutout-key": CUTOUT_WORKER_KEY },
    signal: AbortSignal.timeout(CUTOUT_TIMEOUT_MS),
  });

  if (!response.ok) {
    const reason = await response.text().catch(() => "");
    throw new Error(`Cloudflare background removal answered ${response.status} ${reason.slice(0, 200)}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// `image` trimmed to the garment when it has transparency (a cut-out);
// a photo as taken is left whole.
async function trimmed(image, isCutout) {
  if (!isCutout) return image;

  try {
    return await sharp(image).trim({ threshold: TRIM_THRESHOLD }).toBuffer();
  } catch {
    // Nothing to trim (e.g. all transparent): keep it as it is.
    return image;
  }
}

// Stores the photo's sizes under a new image key.
async function storeSizes(userId, image) {
  const imageKey = newPhotoKey(userId);
  const files = photoFiles(imageKey);

  await Promise.all(
    PHOTO_SIZES.map(async (size, index) => {
      const body = await sharp(image)
        .rotate()
        .resize(size, size, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      await r2.writeFile(files[index], body, "image/webp");
    })
  );

  return imageKey;
}

/*
 * Makes an item photo from the user's upload. Resolves to
 *   { imageKey, removedBy: "phone" | "cloudflare" | null, image }
 * where `image` is the processed photo (for Gemini; not stored as is) and
 * removedBy says who removed the background (null: kept as taken, by
 * choice or because Cloudflare failed). Throws PhotoError if the upload
 * is missing or too big.
 */
async function processUpload({ userId, uploadKey, background }) {
  const info = await r2.fileInfo(uploadKey);

  if (!info) throw new PhotoError("The upload wasn't found. Please try again.", 404);
  if (info.bytes > MAX_UPLOAD_BYTES) {
    await r2.deleteFile(uploadKey).catch(() => {});
    throw new PhotoError("That photo is too big.", 413);
  }

  let image;
  let removedBy = null;

  if (background === "remove") {
    try {
      image = await cloudflareCutout(uploadKey);
      removedBy = "cloudflare";
    } catch (error) {
      console.error("[photo] Cloudflare background removal failed, keeping the photo as taken:", error.message || error);
    }
  }

  if (!image) {
    image = await r2.readFile(uploadKey);
    if (background === "phone") removedBy = "phone";
  }

  const photo = await trimmed(image, removedBy !== null);
  const imageKey = await storeSizes(userId, photo);

  await r2.deleteFile(uploadKey).catch((error) => console.error("[photo] couldn't delete the upload:", error.message));

  return { imageKey, removedBy, image: photo };
}

// Deletes a photo's stored files. Failures are logged, not thrown - a
// stray file shouldn't fail a save or a delete.
async function deletePhoto(imageKey, reason) {
  if (!imageKey) return;

  try {
    await r2.deleteFiles(photoFiles(imageKey));
  } catch (error) {
    console.error(`[photo] couldn't delete ${imageKey} (${reason}):`, error.message);
  }
}

// Deletes every file of a user (deleting their account).
async function deleteUserFiles(userId) {
  try {
    const keys = await r2.listFiles(userPrefix(userId));
    await r2.deleteFiles(keys);
  } catch (error) {
    console.error(`[photo] couldn't delete the files of user ${userId}:`, error.message);
  }
}

module.exports = { processUpload, deletePhoto, deleteUserFiles, PhotoError };
