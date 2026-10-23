// server/services/matchRefreshService.js
//
// Keeps a clothing item's existing outfits in step with it after the item is
// edited. Runs from updateItem (allControllers.js) before the usual search
// for new outfits (matchService.processMatches), and only when a field
// matching reads has changed - renaming an item does nothing here.
//
// A change to a field that decides the outfits (REMATCH_ITEM_FIELDS:
// type, subtype, colours, seasons, tags, styles) rematches the item: every
// one of its outfits that isn't protected is deleted, and the search that
// follows builds them again with new scores (it skips the protected ones,
// which still exist). Any other change (the tights answer) only re-checks
// each outfit on its own, with the same rules the search uses (shape,
// compatibility, layering, colour, pattern, shared season, shared tag), and
// deletes the unprotected ones that fail.
//
// Protected outfits (matchProtection.js: favourites, user-made, worn, or
// changed by hand) are never deleted, even when they no longer pass. They
// only get the outfit fields fed by the item fields that changed
// (ITEM_FIELD_TO_OUTFIT_FIELDS) refreshed, so the user's own edits to their
// other fields survive. Their score, rejections and wear history are never
// touched. Deleting lowers no pair scores - it's a system clean-up, not the
// user disliking the outfit - and takes any Today entries pointing at the
// outfit with it.

const { Match, Clothes, Today } = require("../models/AllModels.js");
const { OUTFIT_SHAPES, ROLES } = require("../constants/outfitShapes.js");
const { describeOutfit, validateOutfit, hasSharedSeason } = require("./outfitEvaluator.js");
const { hasSharedTag } = require("./helpers.js");
const { buildMatchingContext } = require("./matchService.js");
const { getUserMatchingPreferences } = require("./matchScoreService.js");
const { deleteMatches } = require("./matchLifecycleService.js");
const { isProtectedMatch } = require("./matchProtection.js");

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
  wearWithTights: ["tights"],
  type: ["min_temp", "max_temp", "tights", ...ROLE_COUNT_FIELDS],
};

const MATCHING_ITEM_FIELDS = Object.keys(ITEM_FIELD_TO_OUTFIT_FIELDS);

// Item fields whose change rematches the item from scratch.
const REMATCH_ITEM_FIELDS = ["type", "subtype", "colors", "spring", "summer", "autumn", "winter", "tags", "styles"];

const needsRematch = (changedItemFields) =>
  changedItemFields.some((field) => REMATCH_ITEM_FIELDS.includes(field));

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
// left alone. `rematch` deletes every unprotected outfit, valid or not.
function planMatchRefresh(matches, itemsById, outfitFields, context, { rematch = false } = {}) {
  const updates = [];
  const deleteIds = [];

  matches.forEach((match) => {
    const items = match.clothes.map((id) => itemsById.get(String(id)));

    if (items.some((item) => !item)) {
      return;
    }

    if (!isProtectedMatch(match) && (rematch || !isValidAutoOutfit(items, context))) {
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
    .select("clothes favourite userMade userEdited lastWornDate timesWorn " + outfitFields.join(" "));

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

  const { updates, deleteIds } = planMatchRefresh(matches, itemsById, outfitFields, context, {
    rematch: needsRematch(changedItemFields),
  });

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
  REMATCH_ITEM_FIELDS,
  needsRematch,
  changedMatchingFields,
  outfitFieldsFor,
  isProtectedMatch,
  fitsAnOutfitShape,
  isValidAutoOutfit,
  planMatchRefresh,
  refreshMatchesForItem,
};
