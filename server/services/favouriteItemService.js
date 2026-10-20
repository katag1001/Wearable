// server/services/favouriteItemService.js
//
// Favourite clothing items (Clothes.favourite). An automatic outfit with at
// least one favourite item gets FAVOURITE_ITEM_BONUS added to its stored
// score - once, however many of its items are favourites - and never above
// MAX_AUTO_SCORE (constants/scoring.js). The amount actually added is kept
// in Match.favouriteItemBonus, so unfavouriting takes off exactly that.
// User-made outfits never get it: they stay at USER_MADE_SCORE.
//
// The bonus is only ever added to outfits that have already been chosen -
// new automatic outfits get it after every check and the best-100 cut
// (matchService.js), never during the search - so it can't let a weaker
// outfit in.

const { Clothes, Match } = require("../models/AllModels.js");
const {
  FAVOURITE_ITEM_BONUS,
  MAX_AUTO_SCORE,
  MIN_SCORE,
} = require("../constants/scoring.js");

// The bonus an automatic outfit with this score gets: FAVOURITE_ITEM_BONUS,
// or less if that would take it above MAX_AUTO_SCORE.
const favouriteItemBonusFor = (score) =>
  Math.max(0, Math.min(FAVOURITE_ITEM_BONUS, MAX_AUTO_SCORE - score));

// The ids (as strings) of the favourite items in a wardrobe.
const favouriteItemIds = (items) =>
  new Set(
    (items || [])
      .filter((item) => item?.favourite)
      .map((item) => String(item._id))
  );

// New automatic matches (plain objects with `clothes` ids and `score`) with
// the bonus added to every one that has a favourite item. Returns a new
// array; the rest are unchanged.
const applyFavouriteItemBonus = (matches, favouriteIds) =>
  matches.map((match) => {
    if (match.userMade) return match;

    const hasFavourite = (match.clothes || []).some((id) =>
      favouriteIds.has(String(id))
    );

    if (!hasFavourite) return match;

    const bonus = favouriteItemBonusFor(match.score);

    return { ...match, score: match.score + bonus, favouriteItemBonus: bonus };
  });

// The item was just favourited: every automatic outfit with it that doesn't
// already have the bonus gets it.
const addFavouriteItemBonus = (userId, itemId) =>
  Match.updateMany(
    {
      userId,
      clothes: itemId,
      userMade: { $ne: true },
      favouriteItemBonus: { $in: [0, null] },
    },
    [
      {
        $set: {
          favouriteItemBonus: {
            $max: [
              0,
              {
                $min: [
                  FAVOURITE_ITEM_BONUS,
                  { $subtract: [MAX_AUTO_SCORE, "$score"] },
                ],
              },
            ],
          },
        },
      },
      { $set: { score: { $add: ["$score", "$favouriteItemBonus"] } } },
    ],
    { updatePipeline: true }
  );

// The item was just unfavourited: outfits with it lose their bonus, unless
// another of their items is still a favourite.
const removeFavouriteItemBonus = async (userId, itemId) => {
  const otherFavouriteIds = await Clothes.distinct("_id", {
    userId,
    favourite: true,
    _id: { $ne: itemId },
  });

  return Match.updateMany(
    {
      userId,
      favouriteItemBonus: { $gt: 0 },
      $and: [{ clothes: itemId }, { clothes: { $nin: otherFavouriteIds } }],
    },
    [
      {
        $set: {
          score: {
            $max: [MIN_SCORE, { $subtract: ["$score", "$favouriteItemBonus"] }],
          },
          favouriteItemBonus: 0,
        },
      },
    ],
    { updatePipeline: true }
  );
};

// After an item's `favourite` changed (the item as saved).
const syncFavouriteItemBonus = (userId, item) =>
  item.favourite
    ? addFavouriteItemBonus(userId, item._id)
    : removeFavouriteItemBonus(userId, item._id);

module.exports = {
  favouriteItemBonusFor,
  favouriteItemIds,
  applyFavouriteItemBonus,
  addFavouriteItemBonus,
  removeFavouriteItemBonus,
  syncFavouriteItemBonus,
};
