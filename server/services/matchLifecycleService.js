// server/services/matchLifecycleService.js
//
// Wraps deleting Match documents. Only a deliberate, single-match delete by
// the user counts as a "dislike" and lowers the personal pair scores
// (matchScoreService.recordOutfitDeleted). Bulk deletes - delete-by-piece,
// and the cascade that runs when a wardrobe item itself is removed - say
// nothing about whether the user liked the outfit, so they just delete the
// matches and leave the scores alone.

const { Match, Clothes } = require("../models/AllModels.js");
const { getBaselineMatrixForUser, recordOutfitDeleted } = require("./matchScoreService.js");

async function deleteMatchesAndDecrementScores(filter, userId) {
  const matches = await Match.find(filter);

  if (!matches.length) {
    return { deletedCount: 0 };
  }

  const baselineMatrix = await getBaselineMatrixForUser(userId);

  const allClothesIds = [
    ...new Set(matches.flatMap((match) => match.clothes.map(String))),
  ];

  const clothesDocs = await Clothes.find({ _id: { $in: allClothesIds } });
  const clothesById = new Map(clothesDocs.map((doc) => [String(doc._id), doc]));

  for (const match of matches) {
    const items = match.clothes
      .map((id) => clothesById.get(String(id)))
      .filter(Boolean);

    if (items.length) {
      await recordOutfitDeleted(userId, items, baselineMatrix);
    }
  }

  const result = await Match.deleteMany(filter);

  return { deletedCount: result.deletedCount };
}

async function deleteMatchesWithoutScoring(filter) {
  const result = await Match.deleteMany(filter);

  return { deletedCount: result.deletedCount };
}

module.exports = { deleteMatchesAndDecrementScores, deleteMatchesWithoutScoring };
