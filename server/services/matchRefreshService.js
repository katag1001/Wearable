// server/services/matchRefreshService.js
//
// Keeps a clothing item's existing outfits in step with it after the item is
// edited. Runs from updateItem (allControllers.js) before the usual search
// for new outfits (matchService.processMatches), and only when a field
// matching reads has changed - renaming an item does nothing here.
//
// Each existing outfit containing the item is re-checked on its own, with
// the same rules the search uses (shape, compatibility, layering, colour,
// pattern, shared season, shared tag). The search itself can't decide this:
// it's capped (pool sizes, MAX_NEW_MATCHES_PER_ITEM, time budget), so a valid
// outfit missing from its results isn't proof the outfit is invalid.
//
//  - Still valid: kept, with its outfit fields refreshed.
//  - No longer valid, unprotected: deleted, without lowering any pair scores
//    (it's a system clean-up, not the user disliking the outfit), along with
//    any Today entries pointing at it.
//  - No longer valid, protected: kept and refreshed anyway. An outfit is
//    protected if it's a favourite, user-made, or has ever been worn.
//
// Refreshing only rewrites the outfit fields fed by the item fields that
// changed (ITEM_FIELD_TO_OUTFIT_FIELDS), so manual edits to an outfit's other
// fields (seasons, temperature, tags - viewMatchesCard.jsx) survive. Score,
// rejections and wear history are never touched, so a kept outfit doesn't
// come back looking new.

const { Match, Clothes, Today } = require("../models/AllModels.js");
const { OUTFIT_SHAPES, ROLES } = require("../constants/outfitShapes.js");
const { describeOutfit, validateOutfit, hasSharedSeason } = require("./outfitEvaluator.js");
const { hasSharedTag } = require("./helpers.js");
const { buildMatchingContext } = require("./matchService.js");
const { getUserMatchingPreferences } = require("./matchScoreService.js");
const { deleteMatches } = require("./matchLifecycleService.js");

const ROLE_COUNT_FIELDS = ["topCount", "bottomCount", "onepieceCount", "outerCount", "hasOuter"];

// Which outfit fields (describeOutfit's output) each matching item field feeds.
const ITEM_FIELD_TO_OUTFIT_FIELDS = {
  spring: ["spring"],
  summer: ["summer"],
  autumn: ["autumn"],
  winter: ["winter"],
  colors: ["colors"],
  styles: ["styles"],
  tags: ["tags"],
  subtype: ["min_temp", "max_temp", "tights"],
  type: ["min_temp", "max_temp", "tights", ...ROLE_COUNT_FIELDS],
};

const MATCHING_ITEM_FIELDS = Object.keys(ITEM_FIELD_TO_OUTFIT_FIELDS);

// Arrays compare as sets, so reordering an item's colours isn't a change.
function normalise(value) {
  if (Array.isArray(value)) {
    return [...value].map(String).sort().join("\u0000");
  }

  return String(value ?? "");
}

function isSameValue(a, b) {
  return normalise(a) === normalise(b);
}

function changedMatchingFields(before, after) {
  return MATCHING_ITEM_FIELDS.filter((field) => !isSameValue(before[field], after[field]));
}

function outfitFieldsFor(changedItemFields) {
  return [...new Set(changedItemFields.flatMap((field) => ITEM_FIELD_TO_OUTFIT_FIELDS[field] || []))];
}

function isProtectedMatch(match) {
  return (
    !!match.favourite ||
    !!match.userMade ||
    match.lastWornDate != null ||
    (match.timesWorn || 0) > 0
  );
}

function fitsAnOutfitShape(items) {
  const counts = { top: 0, bottom: 0, onepiece: 0, outer: 0 };

  for (const item of items) {
    if (!ROLES.includes(item.type)) {
      return false;
    }

    counts[item.type] += 1;
  }

  return OUTFIT_SHAPES.some((shape) => ROLES.every((role) => shape[role] === counts[role]));
}

// The search's rules, applied to one finished outfit. Shape-level layering
// (fitsShape) is covered by validateOutfit's layering check.
function isValidAutoOutfit(items, context) {
  return (
    fitsAnOutfitShape(items) &&
    hasSharedSeason(items) &&
    hasSharedTag(items) &&
    validateOutfit(items, context)
  );
}

// Pure: works out what to do with each existing outfit. `itemsById` must
// hold every clothing item in `matches`; an outfit with a missing item is
// left alone.
function planMatchRefresh(matches, itemsById, outfitFields, context) {
  const updates = [];
  const deleteIds = [];

  matches.forEach((match) => {
    const items = match.clothes.map((id) => itemsById.get(String(id)));

    if (items.some((item) => !item)) {
      return;
    }

    if (!isProtectedMatch(match) && !isValidAutoOutfit(items, context)) {
      deleteIds.push(match._id);
      return;
    }

    // isUserMade: true - describe it whether or not it would pass the search.
    const described = describeOutfit(items, {
      isUserMade: true,
      temperaturePreference: context.temperaturePreference,
    });

    const fields = {};

    outfitFields.forEach((field) => {
      if (!isSameValue(match[field], described[field])) {
        fields[field] = described[field];
      }
    });

    if (Object.keys(fields).length) {
      updates.push({ _id: match._id, fields });
    }
  });

  return { updates, deleteIds };
}

async function refreshMatchesForItem(item, changedItemFields) {
  const outfitFields = outfitFieldsFor(changedItemFields);

  if (!outfitFields.length) {
    return { updatedCount: 0, deletedCount: 0 };
  }

  const { userId } = item;

  const matches = await Match.find({ userId, clothes: item._id })
    .select("clothes favourite userMade lastWornDate timesWorn " + outfitFields.join(" "));

  if (!matches.length) {
    return { updatedCount: 0, deletedCount: 0 };
  }

  const clothesIds = [...new Set(matches.flatMap((match) => match.clothes.map(String)))];

  const [clothes, { gender, colour, temperature }] = await Promise.all([
    Clothes.find({ _id: { $in: clothesIds }, userId }),
    getUserMatchingPreferences(userId),
  ]);

  const itemsById = new Map(clothes.map((doc) => [String(doc._id), doc]));
  const context = buildMatchingContext({ gender, colour, temperature });

  const { updates, deleteIds } = planMatchRefresh(matches, itemsById, outfitFields, context);

  if (updates.length) {
    await Match.bulkWrite(
      updates.map(({ _id, fields }) => ({
        updateOne: { filter: { _id, userId }, update: { $set: fields } },
      })),
      { ordered: false }
    );
  }

  let deletedCount = 0;

  if (deleteIds.length) {
    ({ deletedCount } = await deleteMatches({ _id: { $in: deleteIds }, userId }));
    await Today.deleteMany({ userId, matchId: { $in: deleteIds } });
  }

  return { updatedCount: updates.length, deletedCount };
}

module.exports = {
  ITEM_FIELD_TO_OUTFIT_FIELDS,
  changedMatchingFields,
  outfitFieldsFor,
  isProtectedMatch,
  fitsAnOutfitShape,
  isValidAutoOutfit,
  planMatchRefresh,
  refreshMatchesForItem,
};
