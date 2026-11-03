const { analyseImage } = require("../services/itemAnalysisService.js");
const { isGeminiConfigured } = require("../services/geminiClient.js");
const { loadAnalysisImage } = require("../services/analysisImageService.js");
const { removeBackground } = require("../services/backgroundRemovalService.js");
const { claimAnalysis } = require("../services/analysisQuotaService.js");
const { loadTakenNames } = require("../services/itemNameService.js");
const { getUserMatchingPreferences } = require("../services/matchScoreService.js");
const { isImageUsedByAnotherUser } = require("../services/imageService.js");
const { DAILY_ANALYSIS_LIMIT } = require("../constants/itemAnalysis.js");

/*
 * POST /items/analyse { cloudinaryId }
 *
 * Fills in a new item from its photo. The app uploads the photo to
 * Cloudinary first, then sends its public id here. The photo's background
 * is removed first (services/backgroundRemovalService.js) and the result
 * is what Gemini sees. Answers 200 with
 *   { status: "ok", kind: "clothing" | "footwear", fields, image, remaining }
 *   { status: "multiple" | "none", image, remaining }
 * where `fields` is ready to save as the new item (nothing is saved here)
 * and `image` is the background-removed photo:
 *   { imageUrl, cloudinaryId, createdIds } - save the item with imageUrl
 *   and cloudinaryId; createdIds are every image made, to delete if it's
 *   never saved.
 * `image` is null if the background couldn't be removed - the photo is
 * then analysed and saved as uploaded.
 * Errors carry a `code`: not_configured, daily_limit, failed (a failed
 * analysis also sends `image`).
 */
exports.analyseItem = async (req, res) => {
  const userId = req.user?.userId;
  const { cloudinaryId } = req.body || {};

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!cloudinaryId || typeof cloudinaryId !== "string") {
    return res.status(400).json({ error: "Missing cloudinaryId" });
  }

  if (!isGeminiConfigured()) {
    return res.status(503).json({ error: "Photo analysis isn't set up", code: "not_configured" });
  }

  // The background-removed photo, once made - sent back even if the
  // analysis then fails, so the app can use it (or delete it).
  let removedImage = null;

  try {
    // Only the user's own new photo (or one of their own items').
    if (await isImageUsedByAnotherUser(cloudinaryId, userId)) {
      return res.status(403).json({ error: "That image belongs to another user" });
    }

    const quota = await claimAnalysis(userId);

    if (!quota.allowed) {
      return res.status(429).json({
        error: `You've reached today's limit of ${DAILY_ANALYSIS_LIMIT} photo analyses. Add the item by hand, or try again tomorrow.`,
        code: "daily_limit",
      });
    }

    const [removed, { gender }, takenNames] = await Promise.all([
      removeBackground(cloudinaryId).catch((error) => {
        console.error("[analyse item] background not removed, analysing the photo as uploaded:", error.message || error);
        return null;
      }),
      getUserMatchingPreferences(userId),
      loadTakenNames(userId),
    ]);

    removedImage = removed;

    const image = await loadAnalysisImage(removed?.cloudinaryId || cloudinaryId);
    const result = await analyseImage({ image, gender, takenNames });

    console.log("[analyse item]", { userId, status: result.status, backgroundRemoved: !!removed, usage: result.usage });

    if (result.status === "failed") {
      console.error("[analyse item] no usable answer:", result.problems);
      return res.status(502).json({ error: "Couldn't analyse the photo", code: "failed", image: removedImage });
    }

    return res.json({
      status: result.status,
      ...(result.status === "ok" && { kind: result.kind, fields: result.fields }),
      image: removedImage,
      remaining: quota.remaining,
    });
  } catch (error) {
    console.error("[analyse item] FAILED", error);
    return res.status(502).json({ error: "Couldn't analyse the photo", code: "failed", image: removedImage });
  }
};
