// server/services/analysisQuotaService.js
//
// The daily limit on photos processed per user (DAILY_ANALYSIS_LIMIT in
// constants/itemAnalysis.js) - analysed by Gemini, or only background-
// removed for users who opted out of AI analysis; both share one count.
// The count is kept on the user's Preferences (analysisDay +
// analysisCount) and claimed before the photo is processed, in one atomic
// update - two requests at once can't both take the last one. Days are UTC.

const { Preferences } = require("../models/AllModels.js");
const { DAILY_ANALYSIS_LIMIT } = require("../constants/itemAnalysis.js");

const dayOf = (date) => date.toISOString().slice(0, 10);

const isDuplicateKey = (error) => error?.code === 11000;

// A user who somehow has no preferences yet still gets a count.
async function ensurePreferences(userId) {
  try {
    await Preferences.updateOne({ userId }, { $setOnInsert: { userId } }, { upsert: true });
  } catch (error) {
    // Created at the same moment by another request.
    if (!isDuplicateKey(error)) throw error;
  }
}

// { allowed, remaining } - takes one analysis from today's allowance.
async function claimAnalysis(userId, now = new Date()) {
  const day = dayOf(now);

  await ensurePreferences(userId);

  const sameDay = await Preferences.findOneAndUpdate(
    { userId, analysisDay: day, analysisCount: { $lt: DAILY_ANALYSIS_LIMIT } },
    { $inc: { analysisCount: 1 } },
    { new: true }
  );

  if (sameDay) {
    return { allowed: true, remaining: DAILY_ANALYSIS_LIMIT - sameDay.analysisCount };
  }

  const newDay = await Preferences.findOneAndUpdate(
    { userId, analysisDay: { $ne: day } },
    { $set: { analysisDay: day, analysisCount: 1 } },
    { new: true }
  );

  if (newDay) {
    return { allowed: true, remaining: DAILY_ANALYSIS_LIMIT - 1 };
  }

  return { allowed: false, remaining: 0 };
}

module.exports = { claimAnalysis, dayOf };
