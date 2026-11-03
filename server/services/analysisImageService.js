// server/services/analysisImageService.js
//
// Fetches an uploaded photo from Cloudinary, shrunk to at most
// IMAGE_MAX_SIZE pixels a side as a JPEG, ready to send to Gemini. A photo
// with its background removed is put on plain light grey (the prompt says
// so): JPEG has no transparency, and grey keeps white and black pieces'
// edges visible. The photo is uploaded by the app straight to Cloudinary
// (core/api/images.js), so it never passes through this server's request
// body.

const cloudinary = require("../cloudinary.js");
const { IMAGE_MAX_SIZE, ANALYSIS_BACKGROUND } = require("../constants/itemAnalysis.js");

const analysisImageUrl = (publicId) =>
  cloudinary.url(publicId, {
    secure: true,
    format: "jpg",
    transformation: [
      { width: IMAGE_MAX_SIZE, height: IMAGE_MAX_SIZE, crop: "limit", quality: "auto", background: ANALYSIS_BACKGROUND },
    ],
  });

// { mimeType, data (base64) }. Throws if Cloudinary doesn't have it.
async function loadAnalysisImage(publicId) {
  const response = await fetch(analysisImageUrl(publicId));

  if (!response.ok) {
    throw new Error(`Couldn't load the image (${response.status})`);
  }

  const data = Buffer.from(await response.arrayBuffer()).toString("base64");

  return { mimeType: "image/jpeg", data };
}

module.exports = { loadAnalysisImage, analysisImageUrl };
