// api/services/matchScoreService.js
//
// Reads and writes a user's personal combination-scoring overrides, and
// resolves which shared baseline matrix a user is on. Storage is sparse: a
// MatchScore document only exists for a subtype pair once the user has
// actually created or deleted an outfit containing it. Any pair without a
// document falls back live to the shared gender+style baseline in
// api/constants/matchScoreBaseline.js.

const { MatchScore, Preferences } = require("../models/AllModels.js");
const { matchScoreBaseline } = require("../constants/matchScoreBaseline.js");
const { canonicalPairKey, personalScoreMapKey } = require("./matrixService.js");

const DEFAULT_GENDER = "unisex";
const DEFAULT_STYLE = "fun";

async function getUserGenderStyle(userId) {
  const preferences = await Preferences.findOne({ userId });

  const gender = preferences?.gender || DEFAULT_GENDER;
  const style = preferences?.style || (gender === "man" ? "all" : DEFAULT_STYLE);

  return { gender, style };
}

async function getBaselineMatrixForUser(userId) {
  const { gender, style } = await getUserGenderStyle(userId);

  return (
    matchScoreBaseline[gender]?.[style] ||
    matchScoreBaseline[DEFAULT_GENDER][DEFAULT_STYLE]
  );
}

async function loadUserScores(userId) {
  const docs = await MatchScore.find({ userId });

  const scores = new Map();

  docs.forEach((doc) => {
    scores.set(personalScoreMapKey(doc.subtypeA, doc.subtypeB), doc.score);
  });

  return scores;
}

// Every pair "used" by a finished outfit: every cross-item pair (the normal
// clique), plus a self-pair for any item that occupies its role alone (the
// same rule matrixService.isCliqueValid checks compatibility against).
function pairsForItems(items) {
  const pairs = [];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      pairs.push([items[i].subtype, items[j].subtype]);
    }
  }

  const roleCounts = {};
  items.forEach((item) => {
    roleCounts[item.type] = (roleCounts[item.type] || 0) + 1;
  });

  items.forEach((item) => {
    if (roleCounts[item.type] === 1) {
      pairs.push([item.subtype, item.subtype]);
    }
  });

  return pairs;
}

// Adjusts every pair in `items` by `delta`. A pair with no existing personal
// document is seeded from the baseline (not from 0) before the delta is
// applied, so a pair's very first personal adjustment starts from wherever
// it already stood, not from scratch.
async function adjustScoresForOutfit(userId, items, delta, baselineMatrix) {
  const pairs = pairsForItems(items).map(([a, b]) => canonicalPairKey(a, b));

  if (!pairs.length) {
    return;
  }

  const existingDocs = await MatchScore.find({
    userId,
    $or: pairs.map(([subtypeA, subtypeB]) => ({ subtypeA, subtypeB })),
  });

  const existingKeys = new Set(
    existingDocs.map((doc) => personalScoreMapKey(doc.subtypeA, doc.subtypeB))
  );

  const operations = pairs.map(([subtypeA, subtypeB]) => {
    if (existingKeys.has(personalScoreMapKey(subtypeA, subtypeB))) {
      return {
        updateOne: {
          filter: { userId, subtypeA, subtypeB },
          update: { $inc: { score: delta } },
        },
      };
    }

    const baselineScore = baselineMatrix?.[subtypeA]?.[subtypeB] ?? 0;

    return {
      insertOne: {
        document: { userId, subtypeA, subtypeB, score: baselineScore + delta },
      },
    };
  });

  await MatchScore.bulkWrite(operations);
}

async function recordOutfitCreated(userId, items, baselineMatrix) {
  await adjustScoresForOutfit(userId, items, 1, baselineMatrix);
}

async function recordOutfitDeleted(userId, items, baselineMatrix) {
  await adjustScoresForOutfit(userId, items, -1, baselineMatrix);
}

async function wipeUserScores(userId) {
  await MatchScore.deleteMany({ userId });
}

module.exports = {
  getUserGenderStyle,
  getBaselineMatrixForUser,
  loadUserScores,
  pairsForItems,
  recordOutfitCreated,
  recordOutfitDeleted,
  wipeUserScores,
};
