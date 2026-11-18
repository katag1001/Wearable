// server/controllers/imagesControllers.js
//
// Item photos (context/cloudflare-migration-plan.md). Photos live in a
// private Cloudflare R2 bucket; the phone never holds any storage keys.
//
//   POST /images/upload-link { contentType }
//     -> { uploadUrl, uploadKey, contentType }: a short-lived link the
//        phone PUTs one photo to (with that Content-Type)
//   POST /images/process { uploadKey, background?, cutoutFailure? }
//     -> { image: { imageKey, removedBy } }: makes the item photo
//        (services/photoService.js) without analysing it - used when AI
//        analysis is off, for "Use original photo", and when an item's
//        photo is changed
//   POST /images/discard { imageKeys: [...] }
//     -> deletes the user's photos that no item uses (uploads abandoned
//        before saving)
//   GET  /images/file?key=<imageKey>-<size>.webp
//     -> the photo file, only to its owner (logged in). Before launch this
//        moves to a Cloudflare Worker on our own domain
//        (context/before-launch.md).

const r2 = require("../services/storage/r2Storage.js");
const { isOwnPhotoFile, isOwnPhotoKey, isOwnUploadKey, newUploadKey } = require("../services/photoKeys.js");
const { processUpload, deletePhoto, PhotoError } = require("../services/photoService.js");
const { isImageInUse } = require("../services/imageService.js");
const { backgroundChoice, logCutoutFailure } = require("../services/phoneCutoutService.js");
const { PHOTO_CACHE_SECONDS, UPLOAD_LINK_SECONDS, UPLOAD_TYPES } = require("../constants/photos.js");

const MAX_DISCARD = 20;

const unavailable = (res) => res.status(503).json({ error: "Photos aren't available right now", code: "storage_unavailable" });

exports.getUploadLink = async (req, res) => {
  const userId = req.user?.userId;
  const contentType = req.body?.contentType;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!UPLOAD_TYPES[contentType]) return res.status(400).json({ error: "Photos must be JPEG, PNG or WebP" });
  if (!r2.isConfigured()) return unavailable(res);

  try {
    const uploadKey = newUploadKey(userId, UPLOAD_TYPES[contentType]);
    const uploadUrl = await r2.signedUploadUrl(uploadKey, contentType, UPLOAD_LINK_SECONDS);

    return res.json({ uploadUrl, uploadKey, contentType });
  } catch (error) {
    console.error("[images] upload link:", error.message || error);
    return unavailable(res);
  }
};

exports.processPhoto = async (req, res) => {
  const userId = req.user?.userId;
  const uploadKey = req.body?.uploadKey;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!isOwnUploadKey(uploadKey, userId)) return res.status(400).json({ error: "Missing or invalid uploadKey" });

  logCutoutFailure("process photo", userId, req.body);

  try {
    const { imageKey, removedBy } = await processUpload({ userId, uploadKey, background: backgroundChoice(req.body) });

    console.log("[process photo]", { userId, background: backgroundChoice(req.body), removedBy });

    return res.json({ image: { imageKey, removedBy } });
  } catch (error) {
    if (error instanceof PhotoError) return res.status(error.status).json({ error: error.message });

    console.error("[process photo] FAILED", error);
    return res.status(502).json({ error: "Couldn't process the photo", code: "failed" });
  }
};

exports.discardPhotos = async (req, res) => {
  const userId = req.user?.userId;
  const imageKeys = Array.isArray(req.body?.imageKeys) ? req.body.imageKeys.slice(0, MAX_DISCARD) : [];

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  let deleted = 0;

  for (const imageKey of imageKeys) {
    if (!isOwnPhotoKey(imageKey, userId) || (await isImageInUse(imageKey))) continue;

    await deletePhoto(imageKey, "unused upload");
    deleted += 1;
  }

  return res.json({ deleted });
};

exports.getPhotoFile = async (req, res) => {
  const userId = req.user?.userId;
  const key = req.query?.key;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!isOwnPhotoFile(key, userId)) return res.status(404).json({ error: "Not found" });

  try {
    const file = await r2.openFile(key);

    if (!file) return res.status(404).json({ error: "Not found" });

    res.set({
      "Content-Type": file.contentType || "image/webp",
      // Only the owner's own phone may keep it; it never changes.
      "Cache-Control": `private, max-age=${PHOTO_CACHE_SECONDS}, immutable`,
      ...(file.bytes && { "Content-Length": String(file.bytes) }),
      ...(file.etag && { ETag: file.etag }),
    });

    file.body.on("error", (error) => {
      console.error("[images] file stream:", error.message);
      res.destroy(error);
    });

    return file.body.pipe(res);
  } catch (error) {
    console.error("[images] file:", error.message || error);
    return unavailable(res);
  }
};
