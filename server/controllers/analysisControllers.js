const { analyseImage } = require("../services/itemAnalysisService.js");
const { isGeminiConfigured } = require("../services/geminiClient.js");
const { loadAnalysisImage } = require("../services/analysisImageService.js");
const { claimAnalysis } = require("../services/analysisQuotaService.js");
const { loadTakenNames } = require("../services/itemNameService.js");
const { getUserMatchingPreferences } = require("../services/matchScoreService.js");
const { isImageUsedByAnotherUser } = require("../services/imageService.js");
const { DAILY_ANALYSIS_LIMIT } = require("../constants/itemAnalysis.js");

/*
 * POST /items/analyse { cloudinaryId }
 *
 * Fills in a new item from its photo. The app uploads the photo to
 * Cloudinary first, then sends its public id here. Answers 200 with
 *   { status: "ok", kind: "clothing" | "footwear", fields, remaining }
 *   { status: "multiple" | "none", remaining }
 * where `fields` is ready to save as the new item (nothing is saved here).
 * Errors carry a `code`: not_configured, daily_limit, failed.
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

    const [image, { gender }, takenNames] = await Promise.all([
      loadAnalysisImage(cloudinaryId),
      getUserMatchingPreferences(userId),
      loadTakenNames(userId),
    ]);

    const result = await analyseImage({ image, gender, takenNames });

    console.log("[analyse item]", { userId, status: result.status, usage: result.usage });

    if (result.status === "failed") {
      console.error("[analyse item] no usable answer:", result.problems);
      return res.status(502).json({ error: "Couldn't analyse the photo", code: "failed" });
    }

    return res.json({
      status: result.status,
      ...(result.status === "ok" && { kind: result.kind, fields: result.fields }),
      remaining: quota.remaining,
    });
  } catch (error) {
    console.error("[analyse item] FAILED", error);
    return res.status(502).json({ error: "Couldn't analyse the photo", code: "failed" });
  }
};
