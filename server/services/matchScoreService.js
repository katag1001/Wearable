// server/services/matchScoreService.js
//
// Reads and writes a user's personal score adjustments, and resolves which
// baseline matrix/colour palettes a user is on. Storage is sparse: a
// MatchScore document only exists for a subtype pair once the user has
// built, claimed, favourited or deleted an outfit containing it. A pair's
// score is always baseline + adjustment (see outfitScoreService.js), so the
// baseline matrix stays the single source of truth.
//
// Adjustments only ever change scores. They are never stored for a pair
// that can't be matched, and compatibility never reads them.

const { MatchScore, Preferences } = require("../models/AllModels.js");
const { matchScoreBaseline } = require("../constants/matchScoreBaseline.js");
const { LEARNING_DELTAS } = require("../constants/scoring.js");
const { canonicalPairKey, pairKey, isCompatible } = require("./matrixService.js");
const { clampAdjustment } = require("./outfitScoreService.js");

const DEFAULT_GENDER = "unisex";

// Single source for every Preferences-derived matching setting (gender,
// colour level, temperature) - one Preferences fetch per call, reused by
// every caller that needs any of these, rather than each resolving its own.
async function getUserMatchingPreferences(userId) {
  const preferences = await Preferences.findOne({ userId });

  const gender = preferences?.gender || DEFAULT_GENDER;
  const colour = preferences?.colour || null;
  const temperature = preferences?.temperature || null;

  return { gender, colour, temperature };
}

function getBaselineMatrix(gender) {
  return matchScoreBaseline[gender] || matchScoreBaseline[DEFAULT_GENDER];
}

async function getBaselineMatrixForUser(userId) {
  const { gender } = await getUserMatchingPreferences(userId);
  return getBaselineMatrix(gender);
}

async function loadUserAdjustments(userId) {
  const docs = await MatchScore.find({ userId });

  const adjustments = new Map();

  docs.forEach((doc) => {
    adjustments.set(pairKey(doc.subtypeA, doc.subtypeB), doc.adjustment);
  });

  return adjustments;
}

// Every two-item pair in `items`, as the items themselves. This includes
// two physically different items that share a subtype (e.g. two puffer
// coats) - such a pair is never compatible, so it is simply skipped when
// adjusting.
function pairsForItems(items) {
  const pairs = [];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      pairs.push([items[i], items[j]]);
    }
  }

  return pairs;
}

// Adds `delta` to every compatible pair in `items`. Each new adjustment is
// limited so baseline + adjustment stays between 0 and 100. Pairs that
// can't be matched (e.g. two bottoms in a user-built outfit) are skipped,
// so nothing is ever stored for them.
async function adjustScoresForOutfit(userId, items, delta, baselineMatrix) {
  const pairsBySubtypes = new Map();

  pairsForItems(items)
    .filter(([itemA, itemB]) => isCompatible(baselineMatrix, itemA, itemB))
    .forEach(([itemA, itemB]) => {
      const [subtypeA, subtypeB] = canonicalPairKey(itemA.subtype, itemB.subtype);
      pairsBySubtypes.set(pairKey(subtypeA, subtypeB), [subtypeA, subtypeB]);
    });

  if (!pairsBySubtypes.size) {
    return;
  }

  const pairs = [...pairsBySubtypes.values()];

  const existingDocs = await MatchScore.find({
    userId,
    $or: pairs.map(([subtypeA, subtypeB]) => ({ subtypeA, subtypeB })),
  });

  const existingAdjustments = new Map(
    existingDocs.map((doc) => [pairKey(doc.subtypeA, doc.subtypeB), doc.adjustment])
  );

  const operations = pairs.map(([subtypeA, subtypeB]) => {
    const current = existingAdjustments.get(pairKey(subtypeA, subtypeB)) || 0;
    const baseline = baselineMatrix[subtypeA][subtypeB];

    return {
      updateOne: {
        filter: { userId, subtypeA, subtypeB },
        update: { $set: { adjustment: clampAdjustment(baseline, current + delta) } },
        upsert: true,
      },
    };
  });

  await MatchScore.bulkWrite(operations);
}

async function recordOutfitCreated(userId, items, baselineMatrix) {
  await adjustScoresForOutfit(userId, items, LEARNING_DELTAS.created, baselineMatrix);
}

async function recordOutfitClaimed(userId, items, baselineMatrix) {
  await adjustScoresForOutfit(userId, items, LEARNING_DELTAS.claimed, baselineMatrix);
}

async function recordOutfitFavourited(userId, items, baselineMatrix) {
  await adjustScoresForOutfit(userId, items, LEARNING_DELTAS.favourited, baselineMatrix);
}

async function recordOutfitUnfavourited(userId, items, baselineMatrix) {
  await adjustScoresForOutfit(userId, items, LEARNING_DELTAS.unfavourited, baselineMatrix);
}

async function recordOutfitDeleted(userId, items, baselineMatrix) {
  await adjustScoresForOutfit(userId, items, LEARNING_DELTAS.deleted, baselineMatrix);
}

async function wipeUserScores(userId) {
  await MatchScore.deleteMany({ userId });
}

module.exports = {
  getUserMatchingPreferences,
  getBaselineMatrix,
  getBaselineMatrixForUser,
  loadUserAdjustments,
  pairsForItems,
  recordOutfitCreated,
  recordOutfitClaimed,
  recordOutfitFavourited,
  recordOutfitUnfavourited,
  recordOutfitDeleted,
  wipeUserScores,
};
