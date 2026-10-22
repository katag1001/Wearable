// server/services/mismatchService.js
//
// "Mismatch" on the Today page: the user picks two clothing items from the
// outfit on screen that should never be worn together.
//
//  - Each item's `mismatchedWith` gets the other's id, and automatic
//    matching never pairs them again (areMismatched, used by
//    matchService.pairsWithAll and outfitEvaluator.validateOutfit - the
//    checks are in mismatchRules.js). This is the one thing the user does
//    that changes what can be matched - the matrix compatibility check
//    itself still never reads it.
//  - Every outfit with both items is deleted, with its Today entries -
//    except favourites and outfits the user built, which stay. The outfit
//    on screen is always deleted, whatever it is.
//  - Their subtype pair's personal adjustment drops by
//    LEARNING_DELTAS.mismatched (constants/scoring.js). Nothing else in the
//    outfit changes.
//
// Outfits the user builds never check mismatches. Deleting an item takes
// it off every other item's list (forgetMismatches).

const { Clothes, Match, Today } = require("../models/AllModels.js");
const { isValidId } = require("./queryHelpers.js");
const { deleteMatches } = require("./matchLifecycleService.js");
const { getBaselineMatrixForUser, recordMismatch } = require("./matchScoreService.js");

/* -------------------- Marking a mismatch -------------------- */

// The two clothing ids from the request, if they're two different items
// in the outfit; otherwise null.
function parseMismatchPair(clothesIds, outfitClothes) {
  if (!Array.isArray(clothesIds) || clothesIds.length !== 2) {
    return null;
  }

  const pair = clothesIds.map(String);
  const inOutfit = new Set(outfitClothes.map(String));

  if (pair[0] === pair[1] || !pair.every((id) => isValidId(id) && inOutfit.has(id))) {
    return null;
  }

  return pair;
}

// The outfits to delete: every one with both items, apart from favourites
// and user-built ones - but always the outfit on screen.
function mismatchedOutfitsFilter(userId, matchId, pair) {
  return {
    userId,
    clothes: { $all: pair },
    $or: [
      { _id: matchId },
      { favourite: { $ne: true }, userMade: { $ne: true } },
    ],
  };
}

// Returns { deletedMatchIds }, or { notFound: true } / { invalid: true }.
async function markMismatch(userId, matchId, clothesIds) {
  const match = await Match.findOne({ _id: matchId, userId }).select("clothes");

  if (!match) {
    return { notFound: true };
  }

  const pair = parseMismatchPair(clothesIds, match.clothes);

  if (!pair) {
    return { invalid: true };
  }

  const items = await Clothes.find({ _id: { $in: pair }, userId });

  if (items.length !== 2) {
    return { invalid: true };
  }

  const [itemA, itemB] = items;

  await Clothes.bulkWrite([
    {
      updateOne: {
        filter: { _id: itemA._id, userId },
        update: { $addToSet: { mismatchedWith: itemB._id } },
      },
    },
    {
      updateOne: {
        filter: { _id: itemB._id, userId },
        update: { $addToSet: { mismatchedWith: itemA._id } },
      },
    },
  ]);

  const outfits = await Match.find(mismatchedOutfitsFilter(userId, match._id, pair)).select("_id");
  const deletedMatchIds = outfits.map((outfit) => outfit._id);

  if (deletedMatchIds.length) {
    await deleteMatches({ _id: { $in: deletedMatchIds }, userId });
    await Today.deleteMany({ userId, matchId: { $in: deletedMatchIds } });
  }

  await recordMismatch(userId, itemA, itemB, await getBaselineMatrixForUser(userId));

  return { deletedMatchIds: deletedMatchIds.map(String) };
}

/* -------------------- Deleting an item -------------------- */

async function forgetMismatches(userId, itemId) {
  await Clothes.updateMany(
    { userId, mismatchedWith: itemId },
    { $pull: { mismatchedWith: itemId } }
  );
}

module.exports = {
  parseMismatchPair,
  mismatchedOutfitsFilter,
  markMismatch,
  forgetMismatches,
};
