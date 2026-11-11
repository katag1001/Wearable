// server/services/matchFootwearService.js
//
// The shoes worn with an outfit, remembered on its Match (`footwear`, most
// recently worn first). The Today page shows them first next time, above
// every other shoe (core/footwear/footwearRanking.js).
//  - wearing a shoe with the outfit moves it to the front (never listed
//    twice) and hands back the list from before, so the app can undo it;
//  - undoing puts that earlier list back - a shoe worn with the outfit on
//    an earlier day keeps its place;
//  - the user can set the list by hand: picked in Build Outfit, or added /
//    removed on the outfit screen (setMatchShoes);
//  - deleting a shoe takes it off every outfit, and off any day it was
//    planned for (the plan stays, with no shoe).
// A worn outfit is protected from rematching (matchProtection.js), so the
// list is never lost to a rebuild.

const mongoose = require("mongoose");
const { Match, Footwear } = require("../models/AllModels.js");

const isId = (value) => mongoose.isValidObjectId(value);

// Pure: the list with this shoe moved to the front.
const withShoeFirst = (footwear = [], footwearId) => [
  String(footwearId),
  ...footwear.map(String).filter((id) => id !== String(footwearId)),
];

// Puts the shoe first on the user's outfit. Returns the outfit's list from
// before (ids as strings), or null when there's no such outfit.
const rememberShoe = async (userId, matchId, footwearId) => {
  if (!isId(matchId)) return null;

  const match = await Match.findOne({ _id: matchId, userId }).select("footwear").lean();

  if (!match) return null;

  const previous = (match.footwear || []).map(String);

  await Match.updateOne(
    { _id: matchId, userId },
    { $set: { footwear: withShoeFirst(previous, footwearId) } }
  );

  return previous;
};

// Undoes rememberShoe with the list it returned.
const restoreShoes = async (userId, matchId, previous) => {
  if (!isId(matchId) || !Array.isArray(previous)) return;

  await Match.updateOne(
    { _id: matchId, userId },
    { $set: { footwear: previous.filter(isId) } }
  );
};

// Pure: shoe ids as strings, without repeats, in order.
const uniqueIds = (ids = []) => [...new Set(ids.map(String))];

// Sets the outfit's shoes to the user's own shoes among `footwearIds`, in
// that order. Returns the new list, or null when there's no such outfit.
const setMatchShoes = async (userId, matchId, footwearIds) => {
  if (!isId(matchId) || !Array.isArray(footwearIds)) return null;

  const wanted = uniqueIds(footwearIds.filter(isId));
  const owned = new Set(
    (await Footwear.find({ _id: { $in: wanted }, userId }).distinct("_id")).map(String)
  );
  const footwear = wanted.filter((id) => owned.has(id));

  const { matchedCount } = await Match.updateOne(
    { _id: matchId, userId },
    { $set: { footwear } }
  );

  return matchedCount > 0 ? footwear : null;
};

const forgetShoe = (userId, footwearId) =>
  Promise.all([
    Match.updateMany({ userId, footwear: footwearId }, { $pull: { footwear: footwearId } }),
    Match.updateMany(
      { userId, "plannedFor.footwear": footwearId },
      { $set: { "plannedFor.$[day].footwear": null } },
      { arrayFilters: [{ "day.footwear": footwearId }] }
    ),
  ]);

module.exports = { withShoeFirst, uniqueIds, rememberShoe, restoreShoes, setMatchShoes, forgetShoe };
