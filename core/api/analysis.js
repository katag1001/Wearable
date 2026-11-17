// core/api/analysis.js
//
// Filling in a new item from its photo. The photo must already be on
// Cloudinary (core/api/images.js); the server removes its background and,
// if the user allows AI analysis, sends that to Gemini.
//
// `options` (both calls), for a photo the phone tried to cut out first
// (context/phone-cutout-plan.md):
//   background: "phone" - already cut out on the phone: don't remove it
//               "keep"  - leave the background (strict test build)
//               omitted - remove it with Cloudinary (as before)
//   cutoutFailure: { reason, platform, osVersion } - why the phone
//               couldn't, for the server's log

import { api } from "./client.js";

const photoBody = (cloudinaryId, { background, cutoutFailure } = {}) => ({
  cloudinaryId,
  ...(background && { background }),
  ...(cutoutFailure && { cutoutFailure }),
});

// { status: "ok", kind, fields, image, remaining } | { status: "multiple" | "none", image }
// - `image` is the background-removed photo ({ imageUrl, cloudinaryId,
// createdIds }) or null.
// Throws on failure - the error's response.data.code is "not_configured",
// "daily_limit" or "failed".
export const analyseItemPhoto = async (cloudinaryId, options) => {
  const response = await api.post("/items/analyse", photoBody(cloudinaryId, options));

  return response.data;
};

// For users who opted out of AI analysis: only removes the photo's
// background, nothing goes to Gemini. { image, remaining } - `image` as
// above. Throws on failure - response.data.code is "daily_limit" or
// "failed".
export const removeItemPhotoBackground = async (cloudinaryId, options) => {
  const response = await api.post("/items/remove-background", photoBody(cloudinaryId, options));

  return response.data;
};
