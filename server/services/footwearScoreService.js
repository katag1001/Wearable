// server/services/footwearScoreService.js
//
// A user's learned footwear pairings from the Today page. A pairing is an
// outfit's bottom (or one-piece) subtype with a footwear type, scored as
// baseline (constants/footwearScoreBaseline.js) + the user's adjustment,
// kept within 0-100 like outfit pair scores:
//  - scrolling past a shoe: FOOTWEAR_LEARNING_DELTAS.rejected, at most once
//    per pairing per day;
//  - wearing a shoe: FOOTWEAR_LEARNING_DELTAS.worn, and takes back a
//    rejection of that pairing from the same day;
//  - un-wearing it (another shoe or outfit worn instead the same day):
//    takes the worn delta back off.
// An outfit with no bottom or one-piece has no pairing, so nothing is
// learned for it.
//
// The plan* functions are pure (no DB) and return the fields to store.

const { FootwearScore } = require("../models/AllModels.js");
const { FOOTWEAR_LEARNING_DELTAS } = require("../constants/scoring.js");
const { getFootwearBaseline } = require("../constants/footwearScoreBaseline.js");
const { clampAdjustment } = require("./outfitScoreService.js");
const { wasRejectedSince } = require("./matchRejectionService.js");

/* -------------------- Rules -------------------- */

const shiftAdjustment = (pairing, delta, baseline) =>
  clampAdjustment(baseline, (pairing?.adjustment || 0) + delta);

// Null when this pairing was already rejected today (nothing changes).
const planRejection = (pairing, todayStart, baseline, now = new Date()) => {
  if (wasRejectedSince(pairing, todayStart)) return null;

  return {
    adjustment: shiftAdjustment(pairing, FOOTWEAR_LEARNING_DELTAS.rejected, baseline),
    lastRejectedDate: now,
  };
};

const planWear = (pairing, todayStart, baseline) => {
  const rejectedToday = wasRejectedSince(pairing, todayStart);

  const delta =
    FOOTWEAR_LEARNING_DELTAS.worn -
    (rejectedToday ? FOOTWEAR_LEARNING_DELTAS.rejected : 0);

  return {
    adjustment: shiftAdjustment(pairing, delta, baseline),
    ...(rejectedToday && { lastRejectedDate: null }),
  };
};

const planUnwear = (pairing, baseline) => ({
  adjustment: shiftAdjustment(pairing, -FOOTWEAR_LEARNING_DELTAS.worn, baseline),
});

/* -------------------- Storage -------------------- */

// Loads the pairing, works out its new fields with `plan`, and saves them
// (creating the pairing if needed). Returns the saved pairing, or the
// unchanged one when `plan` returns null.
const updatePairing = async (userId, gender, bottomSubtype, footwearSubtype, plan) => {
  const filter = { userId, bottomSubtype, footwearSubtype };
  const pairing = await FootwearScore.findOne(filter).lean();
  const baseline = getFootwearBaseline(gender, bottomSubtype, footwearSubtype);

  const changes = plan(pairing, baseline);

  if (!changes) return pairing;

  return FootwearScore.findOneAndUpdate(
    filter,
    { $set: changes },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
};

const rejectFootwearPairing = (userId, gender, bottomSubtype, footwearSubtype, todayStart) =>
  updatePairing(userId, gender, bottomSubtype, footwearSubtype, (pairing, baseline) =>
    planRejection(pairing, todayStart, baseline)
  );

const wearFootwearPairing = (userId, gender, bottomSubtype, footwearSubtype, todayStart) =>
  updatePairing(userId, gender, bottomSubtype, footwearSubtype, (pairing, baseline) =>
    planWear(pairing, todayStart, baseline)
  );

const unwearFootwearPairing = (userId, gender, bottomSubtype, footwearSubtype) =>
  updatePairing(userId, gender, bottomSubtype, footwearSubtype, planUnwear);

const loadFootwearPairings = (userId) =>
  FootwearScore.find({ userId })
    .select("bottomSubtype footwearSubtype adjustment lastRejectedDate -_id")
    .lean();

const wipeFootwearScores = (userId) => FootwearScore.deleteMany({ userId });

module.exports = {
  planRejection,
  planWear,
  planUnwear,
  rejectFootwearPairing,
  wearFootwearPairing,
  unwearFootwearPairing,
  loadFootwearPairings,
  wipeFootwearScores,
};
