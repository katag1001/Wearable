// server/services/phoneCutoutService.js
//
// The phone app cuts garments out of photos itself before uploading
// (context/phone-cutout-plan.md; mobile/src/platform/garmentCutout.js), so
// each photo request (controllers/analysisControllers.js,
// controllers/imagesControllers.js) says what to do about the background:
//
//   background: "phone" - already cut out on the phone: keep it
//               "none"  - the photo as taken ("Use original photo")
//               anything else / missing - remove it: our Cloudflare Worker
//               does (services/photoService.js); the phone couldn't
//
// and, when the phone couldn't, why (`cutoutFailure`), which is logged so
// failures show up in the server logs after launch. Pure - no DB access.

const REMOVE = "remove";
const BACKGROUND_CHOICES = new Set(["phone", "none"]);

const MAX_TEXT = 300;

// "remove" | "phone" | "none"
const backgroundChoice = (body) => {
  const value = body?.background;

  return BACKGROUND_CHOICES.has(value) ? value : REMOVE;
};

// Whether Cloudflare should remove the background.
const removesBackground = (body) => backgroundChoice(body) === REMOVE;

const shortText = (value) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).slice(0, MAX_TEXT)
    : "";

// The phone's failure report ({ reason, platform, osVersion }), cleaned up
// for the log, or null if it didn't send one.
const cutoutFailureOf = (body) => {
  const failure = body?.cutoutFailure;

  if (!failure || typeof failure !== "object") return null;

  return {
    reason: shortText(failure.reason) || "unknown",
    platform: shortText(failure.platform) || "unknown",
    osVersion: shortText(failure.osVersion) || "unknown",
  };
};

// Logs a failed phone cut-out (Cloudflare then removes the background).
const logCutoutFailure = (label, userId, body) => {
  const failure = cutoutFailureOf(body);

  if (!failure) return;

  console.warn(`[${label}] phone couldn't cut the photo out`, {
    userId,
    ...failure,
    then: removesBackground(body) ? "cloudflare" : "kept as taken",
  });
};

module.exports = { backgroundChoice, removesBackground, cutoutFailureOf, logCutoutFailure };
