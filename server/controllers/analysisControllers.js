const { analyseImage } = require("../services/itemAnalysisService.js");
const { isGeminiConfigured } = require("../services/geminiClient.js");
const { loadAnalysisImage } = require("../services/analysisImageService.js");
const { removeBackground } = require("../services/backgroundRemovalService.js");
const { claimAnalysis } = require("../services/analysisQuotaService.js");
const { getAiAnalysisChoice } = require("../services/aiConsentService.js");
const { loadTakenNames } = require("../services/itemNameService.js");
const { getUserMatchingPreferences } = require("../services/matchScoreService.js");
const { isImageUsedByAnotherUser } = require("../services/imageService.js");
const { DAILY_ANALYSIS_LIMIT } = require("../constants/itemAnalysis.js");

/*
 * A new item's photo, after the app has uploaded it to Cloudinary. Its
 * background is always removed (services/backgroundRemovalService.js);
 * then, only for users who said yes to AI analysis (Preferences.aiAnalysis,
 * services/aiConsentService.js), Gemini fills in the item from it.
 *
 *   POST /items/analyse { cloudinaryId }           - remove background + AI
 *   POST /items/remove-background { cloudinaryId } - remove background only
 *
 * Both count towards the same daily limit (DAILY_ANALYSIS_LIMIT).
 */

// The checks both routes share: the user, the photo id, and that the photo
// is the user's own new photo (or one of their own items'). Responds and
// returns null if any fails.
const checkPhotoRequest = async (req, res) => {
  const userId = req.user?.userId;
  const { cloudinaryId } = req.body || {};

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (!cloudinaryId || typeof cloudinaryId !== "string") {
    res.status(400).json({ error: "Missing cloudinaryId" });
    return null;
  }

  if (await isImageUsedByAnotherUser(cloudinaryId, userId)) {
    res.status(403).json({ error: "That image belongs to another user" });
    return null;
  }

  return { userId, cloudinaryId };
};

// Takes one photo from today's allowance; responds 429 and returns null if
// none are left.
const claimPhoto = async (userId, res, limitMessage) => {
  const quota = await claimAnalysis(userId);

  if (!quota.allowed) {
    res.status(429).json({ error: limitMessage, code: "daily_limit" });
    return null;
  }

  return quota;
};

// The background-removed photo, or null if it couldn't be made (the photo
// is then used as uploaded).
const removeBackgroundOrNull = (cloudinaryId, label) =>
  removeBackground(cloudinaryId).catch((error) => {
    console.error(`[${label}] background not removed, using the photo as uploaded:`, error.message || error);
    return null;
  });

/*
 * POST /items/analyse { cloudinaryId }
 *
 * Fills in a new item from its photo. The photo's background is removed
 * first and the result is what Gemini sees. Answers 200 with
 *   { status: "ok", kind: "clothing" | "footwear", fields, image, remaining }
 *   { status: "multiple" | "none", image, remaining }
 * where `fields` is ready to save as the new item (nothing is saved here)
 * and `image` is the background-removed photo:
 *   { imageUrl, cloudinaryId, createdIds } - save the item with imageUrl
 *   and cloudinaryId; createdIds are every image made, to delete if it's
 *   never saved.
 * `image` is null if the background couldn't be removed - the photo is
 * then analysed and saved as uploaded.
 * Errors carry a `code`: not_configured, consent_required (the user hasn't
 * answered the AI prompt), ai_opted_out, daily_limit, failed (a failed
 * analysis also sends `image`).
 */
exports.analyseItem = async (req, res) => {
  if (!isGeminiConfigured()) {
    return res.status(503).json({ error: "Photo analysis isn't set up", code: "not_configured" });
  }

  // The background-removed photo, once made - sent back even if the
  // analysis then fails, so the app can use it (or delete it).
  let removedImage = null;

  try {
    const request = await checkPhotoRequest(req, res);
    if (!request) return undefined;

    const { userId, cloudinaryId } = request;

    // Nothing goes to Gemini without the user's yes.
    const aiChoice = await getAiAnalysisChoice(userId);

    if (aiChoice !== true) {
      return res.status(403).json(
        aiChoice === false
          ? { error: "You've turned off AI photo analysis in Settings.", code: "ai_opted_out" }
          : { error: "Please choose whether to use AI photo analysis first.", code: "consent_required" }
      );
    }

    const quota = await claimPhoto(
      userId,
      res,
      `You've reached today's limit of ${DAILY_ANALYSIS_LIMIT} photo analyses. Add the item by hand, or try again tomorrow.`
    );
    if (!quota) return undefined;

    const [removed, { gender }, takenNames] = await Promise.all([
      removeBackgroundOrNull(cloudinaryId, "analyse item"),
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

/*
 * POST /items/remove-background { cloudinaryId }
 *
 * For users who fill their items in themselves: only removes the photo's
 * background - nothing is sent to Gemini. Answers 200 with
 *   { image, remaining }
 * where `image` is as for /items/analyse (null if the background couldn't
 * be removed - the photo is then saved as uploaded). Errors carry a
 * `code`: daily_limit, failed.
 */
exports.removeItemBackground = async (req, res) => {
  try {
    const request = await checkPhotoRequest(req, res);
    if (!request) return undefined;

    const { userId, cloudinaryId } = request;

    const quota = await claimPhoto(
      userId,
      res,
      `You've reached today's limit of ${DAILY_ANALYSIS_LIMIT} photos. Add the item without a photo, or try again tomorrow.`
    );
    if (!quota) return undefined;

    const removed = await removeBackgroundOrNull(cloudinaryId, "remove background");

    console.log("[remove background]", { userId, backgroundRemoved: !!removed });

    return res.json({ image: removed, remaining: quota.remaining });
  } catch (error) {
    console.error("[remove background] FAILED", error);
    return res.status(502).json({ error: "Couldn't process the photo", code: "failed" });
  }
};
