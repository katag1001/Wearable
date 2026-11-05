// server/services/aiConsentService.js
//
// Whether a user lets AI (Gemini) analyse their item photos - their answer
// to the consent prompt, kept on Preferences.aiAnalysis and changeable in
// Settings. Checked by the server before any photo goes to Gemini
// (controllers/analysisControllers.js), whatever the app asks for.

const { Preferences } = require("../models/AllModels.js");

// true (allowed), false (opted out) or null (not answered yet).
async function getAiAnalysisChoice(userId) {
  const preferences = await Preferences.findOne({ userId }).select("aiAnalysis").lean();

  return typeof preferences?.aiAnalysis === "boolean" ? preferences.aiAnalysis : null;
}

module.exports = { getAiAnalysisChoice };
