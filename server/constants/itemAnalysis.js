// server/constants/itemAnalysis.js
//
// Settings for analysing a new item's photo with Gemini
// (services/itemAnalysisService.js). The prompt wording is in
// constants/analysisPrompt.js.

// Used when GEMINI_MODEL isn't set. A pinned, stable model - a new one only
// changes when this (or GEMINI_MODEL) does.
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

// Saved on every analysed item, so answers from different prompt wordings
// can be told apart later. Bump it whenever the prompt or schema changes.
const PROMPT_VERSION = "v3";

// How much the model thinks before answering ("MINIMAL", "LOW", "MEDIUM",
// "HIGH"). More is slower and costs more.
const THINKING_LEVEL = "LOW";

// Photos each user may have processed per day (UTC) - analysed by Gemini,
// or only background-removed for users who opted out of AI analysis. A
// retry inside one analysis doesn't count again. In shared/ so the apps'
// Settings can show it.
const DAILY_ANALYSIS_LIMIT = require("../../shared/photoLimits.json").dailyPhotoLimit;

// The photo is sent at most this many pixels on its longest side.
const IMAGE_MAX_SIZE = 1024;

// What a background-removed photo is shown on (Cloudinary colour).
const ANALYSIS_BACKGROUND = "rgb:C8C8C8";

// Give up on one Gemini request after this long.
const REQUEST_TIMEOUT_MS = 30000;

// An answer that can't be used (or a Gemini error worth retrying) is asked
// again this many times.
const RETRIES = 1;

const MAX_NAME_LENGTH = 50;
const MAX_COLOURS = 3;

module.exports = {
  DEFAULT_MODEL,
  PROMPT_VERSION,
  THINKING_LEVEL,
  DAILY_ANALYSIS_LIMIT,
  IMAGE_MAX_SIZE,
  ANALYSIS_BACKGROUND,
  REQUEST_TIMEOUT_MS,
  RETRIES,
  MAX_NAME_LENGTH,
  MAX_COLOURS,
};
