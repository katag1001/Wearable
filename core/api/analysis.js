// core/api/analysis.js
//
// Filling in a new item from its photo. The photo must already be uploaded
// (core/api/images.js uploadPhoto); the server makes the item photo from it
// (the phone's cut-out, or Cloudflare removes the background) and, if the
// user allows AI analysis, sends it to Gemini.
//
// `options`:
//   background: "phone" - already cut out on the phone
//               "none"  - the photo as taken
//               omitted - Cloudflare removes the background (the phone
//                         couldn't)
//   cutoutFailure: { reason, platform, osVersion } - why the phone
//               couldn't, for the server's log

import { api } from "./client.js";

// { status: "ok", kind, fields, image, remaining } | { status: "multiple" | "none", image }
// - `image` is the item photo: { imageKey, removedBy }.
// Throws on failure - the error's response.data.code is "not_configured",
// "daily_limit" or "failed" (a failed analysis may still send `image`).
export const analyseItemPhoto = async (uploadKey, { background, cutoutFailure } = {}) => {
  const response = await api.post("/items/analyse", {
    uploadKey,
    ...(background && { background }),
    ...(cutoutFailure && { cutoutFailure }),
  });

  return response.data;
};
