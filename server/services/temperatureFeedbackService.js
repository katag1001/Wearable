// server/services/temperatureFeedbackService.js
//
// "Too hot" / "too cold" on the Today page. The outfit's own min_temp and
// max_temp move TEMPERATURE_FEEDBACK_SHIFT degrees (constants/scoring.js):
// up for too hot, so it's suggested on warmer days, down for too cold. The
// outfit is then hidden from today's list (Today.hidden) - not rejected,
// and its score doesn't change.
//
// Only that one match changes, not the presets: resetMatchTemperatures.js
// and rescoreMatches.js recalculate the range and undo it.

const { Match, Today } = require("../models/AllModels.js");
const { TEMPERATURE_FEEDBACK_SHIFT } = require("../constants/scoring.js");

const FEEL_SHIFTS = {
  too_hot: TEMPERATURE_FEEDBACK_SHIFT,
  too_cold: -TEMPERATURE_FEEDBACK_SHIFT,
};

const isTemperatureFeel = (feel) => Object.hasOwn(FEEL_SHIFTS, feel);

// Pure: the outfit's new range.
function shiftedRange({ min_temp, max_temp }, feel) {
  const shift = FEEL_SHIFTS[feel];

  return { min_temp: min_temp + shift, max_temp: max_temp + shift };
}

// Returns the match's new { min_temp, max_temp }, or null if there's no
// such match.
async function applyTemperatureFeedback(userId, matchId, feel) {
  const match = await Match.findOne({ _id: matchId, userId });

  if (!match) {
    return null;
  }

  Object.assign(match, shiftedRange(match, feel));
  await match.save();

  await Today.updateMany({ userId, matchId: match._id }, { $set: { hidden: true } });

  return { min_temp: match.min_temp, max_temp: match.max_temp };
}

module.exports = { isTemperatureFeel, shiftedRange, applyTemperatureFeedback };
