// server/services/tightsFeedbackService.js
//
// "Can't wear this with tights" on the Today page, for an outfit that's on
// today's list thanks to its tights range. `scope`:
//
//  - "outfit": just this outfit - the match gets `noTights`.
//  - "item": never with its skirt, dress or shorts - the item's
//    `wearWithTights` becomes false, and every outfit with it stops taking
//    tights (`tights: false`; an outfit has only one such item, so nothing
//    else could still allow them).
//
// Either way nothing is deleted. The outfit is hidden from today's list
// (Today.hidden), and for "item" so is every other outfit with that item
// that's only on today's list thanks to tights. From tomorrow they're
// chosen on their range without tights. Scores don't change. Rules for
// tights themselves: tightsService.js.

const { Clothes, Match, Today } = require("../models/AllModels.js");
const { tightsItemOf } = require("./tightsService.js");

const TIGHTS_SCOPES = ["outfit", "item"];

const isTightsScope = (scope) => TIGHTS_SCOPES.includes(scope);

async function hideFromToday(userId, matchIds) {
  await Today.updateMany({ userId, matchId: { $in: matchIds } }, { $set: { hidden: true } });
}

async function noTightsForOutfit(userId, match) {
  match.noTights = true;
  await match.save();

  return [match._id];
}

// Returns the ids to hide, or null if the outfit has no skirt, dress or
// shorts.
async function noTightsForItem(userId, match) {
  const clothes = await Clothes.find({ _id: { $in: match.clothes }, userId }).select("subtype");
  const item = tightsItemOf(clothes);

  if (!item) {
    return null;
  }

  await Clothes.updateOne({ _id: item._id, userId }, { $set: { wearWithTights: false } });
  await Match.updateMany({ userId, clothes: item._id }, { $set: { tights: false } });

  const itemMatchIds = await Match.find({ userId, clothes: item._id }).distinct("_id");
  const onTodayWithTights = await Today.find({
    userId,
    withTights: true,
    matchId: { $in: itemMatchIds },
  }).distinct("matchId");

  return [match._id, ...onTodayWithTights];
}

// Returns { hiddenMatchIds }, or { notFound: true } / { invalid: true }.
async function applyTightsFeedback(userId, matchId, scope) {
  const match = await Match.findOne({ _id: matchId, userId });

  if (!match) {
    return { notFound: true };
  }

  const ids =
    scope === "item"
      ? await noTightsForItem(userId, match)
      : await noTightsForOutfit(userId, match);

  if (!ids) {
    return { invalid: true };
  }

  const hiddenMatchIds = [...new Set(ids.map(String))];

  await hideFromToday(userId, hiddenMatchIds);

  return { hiddenMatchIds };
}

module.exports = { isTightsScope, applyTightsFeedback };
