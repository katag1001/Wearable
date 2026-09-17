// api/services/matchLifecycleService.js
//
// Wraps deleting Match documents so the personal combination-score
// decrement (matchScoreService.recordOutfitDeleted) always happens
// alongside the delete, no matter which of the three places in the app
// deletes a match: the explicit single-match delete, delete-by-piece, or
// the cascade delete that runs when a wardrobe item itself is removed.

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

module.exports = { deleteMatchesAndDecrementScores };
