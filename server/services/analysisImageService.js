// server/services/analysisImageService.js
//
// The photo as Gemini gets it: shrunk to at most IMAGE_MAX_SIZE pixels a
// side, as a JPEG. A cut-out (transparent) is put on plain light grey (the
// prompt says so): JPEG has no transparency, and grey keeps white and
// black pieces' edges visible. Made in memory when a photo is analysed,
// never stored.

const sharp = require("sharp");

const r2 = require("./storage/r2Storage.js");
const { photoFiles } = require("./photoKeys.js");
const { IMAGE_MAX_SIZE, ANALYSIS_BACKGROUND } = require("../constants/itemAnalysis.js");

// "rgb:C8C8C8" -> { r: 200, g: 200, b: 200 }
const backgroundColour = (value) => {
  const hex = String(value).replace(/^rgb:/, "");

  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
};

// { mimeType, data (base64) } from an image (Buffer).
async function analysisImageFrom(image) {
  const jpeg = await sharp(image)
    .flatten({ background: backgroundColour(ANALYSIS_BACKGROUND) })
    .resize(IMAGE_MAX_SIZE, IMAGE_MAX_SIZE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return { mimeType: "image/jpeg", data: jpeg.toString("base64") };
}

// The same for a stored photo (its largest size) - for the AI accuracy
// check (scripts/evaluateItemAnalysis.js).
async function loadAnalysisImage(imageKey) {
  return analysisImageFrom(await r2.readFile(photoFiles(imageKey)[0]));
}

module.exports = { analysisImageFrom, loadAnalysisImage, backgroundColour };
