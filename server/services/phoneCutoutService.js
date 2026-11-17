// server/services/phoneCutoutService.js
//
// The phone app cuts garments out of photos itself before uploading
// (context/phone-cutout-plan.md; mobile/src/platform/garmentCutout.js), so
// the photo routes (controllers/analysisControllers.js) are told what to
// do about the background:
//
//   background: "phone" - already cut out on the phone: leave it
//               "keep"  - leave the background (the strict test build)
//               anything else / missing - remove it with Cloudinary, as
//               before (the web, older apps, and phones that couldn't)
//
// and, when the phone couldn't, why (`cutoutFailure`), which is logged so
// failures show up in the server logs after launch. Pure - no DB access.

const REMOVE = "remove";
const BACKGROUND_CHOICES = new Set(["phone", "keep"]);

const MAX_TEXT = 300;

// "remove" | "phone" | "keep"
const backgroundChoice = (body) => {
  const value = body?.background;

  return BACKGROUND_CHOICES.has(value) ? value : REMOVE;
};

// Whether Cloudinary should remove the background.
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

// Logs a failed phone cut-out (and what happens instead), if there was one.
const logCutoutFailure = (label, userId, body) => {
  const failure = cutoutFailureOf(body);

  if (!failure) return;

  console.warn(`[${label}] phone couldn't cut the photo out`, {
    userId,
    ...failure,
    then: removesBackground(body) ? "cloudinary" : "kept as taken",
  });
};

module.exports = { backgroundChoice, removesBackground, cutoutFailureOf, logCutoutFailure };
