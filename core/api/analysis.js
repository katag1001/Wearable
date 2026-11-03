// core/api/analysis.js
//
// Filling in a new item from its photo. The photo must already be on
// Cloudinary (core/api/images.js); the server removes its background and
// sends that to Gemini.

import { api } from "./client.js";

// { status: "ok", kind, fields, image, remaining } | { status: "multiple" | "none", image }
// - `image` is the background-removed photo ({ imageUrl, cloudinaryId,
// createdIds }) or null.
// Throws on failure - the error's response.data.code is "not_configured",
// "daily_limit" or "failed".
export const analyseItemPhoto = async (cloudinaryId) => {
  const response = await api.post("/items/analyse", { cloudinaryId });

  return response.data;
};
