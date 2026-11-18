const { analyseImage } = require("../services/itemAnalysisService.js");
const { isGeminiConfigured } = require("../services/geminiClient.js");
const { analysisImageFrom } = require("../services/analysisImageService.js");
const { processUpload, PhotoError } = require("../services/photoService.js");
const { claimAnalysis } = require("../services/analysisQuotaService.js");
const { getAiAnalysisChoice } = require("../services/aiConsentService.js");
const { loadTakenNames } = require("../services/itemNameService.js");
const { getUserMatchingPreferences } = require("../services/matchScoreService.js");
const { isOwnUploadKey } = require("../services/photoKeys.js");
const { backgroundChoice, logCutoutFailure } = require("../services/phoneCutoutService.js");
const { DAILY_ANALYSIS_LIMIT } = require("../constants/itemAnalysis.js");

/*
 * POST /items/analyse { uploadKey, background?, cutoutFailure? }
 *
 * Fills in a new item from its photo. The phone has uploaded the photo
 * (controllers/imagesControllers.js); it's made into the item photo here
 * (services/photoService.js: the phone's cut-out, or Cloudflare removes
 * the background when the phone couldn't - `background`,
 * services/phoneCutoutService.js), then, only for users who said yes to AI
 * analysis (Preferences.aiAnalysis, services/aiConsentService.js), Gemini
 * fills the item in from it. Counts towards the daily limit
 * (DAILY_ANALYSIS_LIMIT). Answers 200 with
 *   { status: "ok", kind: "clothing" | "footwear", fields, image, remaining }
 *   { status: "multiple" | "none", image, remaining }
 * where `fields` is ready to save as the new item (nothing is saved here)
 * and `image` is the item photo: { imageKey, removedBy } - save the item
 * with imageKey (or discard it: /images/discard); removedBy is "phone",
 * "cloudflare" or null (kept as taken).
 * Errors carry a `code`: not_configured, consent_required (the user hasn't
 * answered the AI prompt), ai_opted_out, daily_limit, failed (a failed
 * analysis also sends `image` if it was made).
 */
exports.analyseItem = async (req, res) => {
  if (!isGeminiConfigured()) {
    return res.status(503).json({ error: "Photo analysis isn't set up", code: "not_configured" });
  }

  const userId = req.user?.userId;
  const uploadKey = req.body?.uploadKey;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!isOwnUploadKey(uploadKey, userId)) return res.status(400).json({ error: "Missing or invalid uploadKey" });

  // The item photo, once made - sent back even if the analysis then
  // fails, so the app can use it (or delete it).
  let image = null;

  try {
    // Nothing goes to Gemini without the user's yes.
    const aiChoice = await getAiAnalysisChoice(userId);

    if (aiChoice !== true) {
      return res.status(403).json(
        aiChoice === false
          ? { error: "You've turned off AI photo analysis in Settings.", code: "ai_opted_out" }
          : { error: "Please choose whether to use AI photo analysis first.", code: "consent_required" }
      );
    }

    const quota = await claimAnalysis(userId);

    if (!quota.allowed) {
      return res.status(429).json({
        error: `You've reached today's limit of ${DAILY_ANALYSIS_LIMIT} photo analyses. Add the item by hand, or try again tomorrow.`,
        code: "daily_limit",
      });
    }

    logCutoutFailure("analyse item", userId, req.body);

    const [photo, { gender }, takenNames] = await Promise.all([
      processUpload({ userId, uploadKey, background: backgroundChoice(req.body) }),
      getUserMatchingPreferences(userId),
      loadTakenNames(userId),
    ]);

    image = { imageKey: photo.imageKey, removedBy: photo.removedBy };

    const result = await analyseImage({ image: await analysisImageFrom(photo.image), gender, takenNames });

    console.log("[analyse item]", {
      userId,
      status: result.status,
      background: backgroundChoice(req.body),
      removedBy: photo.removedBy,
      usage: result.usage,
    });

    if (result.status === "failed") {
      console.error("[analyse item] no usable answer:", result.problems);
      return res.status(502).json({ error: "Couldn't analyse the photo", code: "failed", image });
    }

    return res.json({
      status: result.status,
      ...(result.status === "ok" && { kind: result.kind, fields: result.fields }),
      image,
      remaining: quota.remaining,
    });
  } catch (error) {
    if (error instanceof PhotoError) return res.status(error.status).json({ error: error.message, code: "failed" });

    console.error("[analyse item] FAILED", error);
    return res.status(502).json({ error: "Couldn't analyse the photo", code: "failed", image });
  }
};
