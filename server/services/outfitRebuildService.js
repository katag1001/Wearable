// server/services/outfitRebuildService.js
//
// Rebuilds a user's automatic outfits after a preference change
// (preferenceChangeService.js decides which), and works out their
// temperature ranges again after a temperature change. A full rebuild takes a couple
// of minutes, longer than one request may run, so the app carries it out
// a chunk at a time (POST /preferences/rebuild) and picks it up again the
// next time it opens if it's interrupted.
//
// Build first, then swap: while it runs the new outfits are saved to
// PendingMatch, where nothing reads them, and the old ones - and Today -
// keep working. Once every item is matched, one step deletes the old
// unprotected outfits in scope and moves the new ones into Match.
//
// - Protected outfits (matchProtection.js) are never touched, and a new
//   outfit that's the same as one is skipped.
// - Outfits saved after the rebuild started (an item added meanwhile)
//   already follow the new preferences, so they're kept.
// - A new outfit with an item deleted meanwhile is dropped at the swap.
// - The temperature ranges go first (outfitTemperatureRefreshService.js);
//   on their own they replace nothing.
// - Each item is ticked off once matched, so an interrupted chunk only
//   repeats the item it was on. The swap can be repeated safely too.

const mongoose = require("mongoose");

const { Match, PendingMatch, Clothes, Today, Preferences } = require("../models/AllModels.js");
const { processMatches, isOnlyDuplicateKeyErrors } = require("./matchService.js");
const { deleteMatches } = require("./matchLifecycleService.js");
const { UNPROTECTED_MATCH_FILTER } = require("./matchProtection.js");
const { msUntilDeadline } = require("../utils/functionDeadline.js");
const { refreshOutfitTemperatures } = require("./outfitTemperatureRefreshService.js");

// How long one chunk keeps matching before it answers, so the app can show
// progress and a dropped connection loses little.
const CHUNK_WORK_MS = 40000;

// Room left before the Vercel deadline for one more item (its search can
// take up to matchService's SEARCH_TIME_LIMIT_MS) and the swap.
const DEADLINE_RESERVE_MS = 120000;

const SWAP_CHUNK_SIZE = 1000;

// The running rebuild ({ refreshTemperatures, allItems, scopeItemIds,
// remainingItemIds, total, startedAt }), or null.
async function getOutfitRebuild(userId) {
  const preferences = await Preferences.findOne({ userId }).select("outfitRebuild").lean();

  return preferences?.outfitRebuild?.startedAt ? preferences.outfitRebuild : null;
}

// { running, remaining, total } for the app.
const rebuildStatus = (rebuild) => ({
  running: Boolean(rebuild),
  remaining: rebuild?.remainingItemIds?.length ?? 0,
  total: rebuild?.total ?? 0,
});

// Starts a rebuild of `itemIds`' outfits (every outfit when `allItems`),
// after the temperature ranges when `refreshTemperatures`. Anything left
// from an earlier rebuild that never finished is cleared.
async function startOutfitRebuild(userId, { refreshTemperatures = false, allItems, itemIds }) {
  await PendingMatch.deleteMany({ userId });

  const outfitRebuild = {
    refreshTemperatures,
    allItems,
    scopeItemIds: allItems ? [] : itemIds,
    remainingItemIds: itemIds,
    total: itemIds.length,
    startedAt: new Date(),
  };

  await Preferences.updateOne({ userId }, { $set: { outfitRebuild } });

  return outfitRebuild;
}

// The outfits the rebuild replaces: unprotected, in scope, and saved before
// it started (ObjectIds start with their creation time).
function replacedOutfitsFilter(userId, rebuild) {
  const startedId = mongoose.Types.ObjectId.createFromTime(
    Math.floor(new Date(rebuild.startedAt).getTime() / 1000)
  );

  return {
    userId,
    ...UNPROTECTED_MATCH_FILTER,
    _id: { $lt: startedId },
    ...(rebuild.allItems ? {} : { clothes: { $in: rebuild.scopeItemIds } }),
  };
}

// The outfits matching mustn't find again: the ones staying in Match and
// the ones the rebuild has already found.
async function keysToSkip(userId, rebuild) {
  const [staying, pending] = await Promise.all([
    Match.find({ userId, $nor: [replacedOutfitsFilter(userId, rebuild)] }).distinct("clothesKey"),
    PendingMatch.find({ userId }).distinct("clothesKey"),
  ]);

  return new Set([...staying, ...pending]);
}

// Deletes the replaced outfits (with their Today entries) and moves the new
// ones into Match, then ends the rebuild. Returns the deleted outfit ids.
async function swapInRebuiltOutfits(userId, rebuild) {
  const replacedIds = await Match.find(replacedOutfitsFilter(userId, rebuild)).distinct("_id");

  if (replacedIds.length) {
    await deleteMatches({ _id: { $in: replacedIds }, userId });
    await Today.deleteMany({ userId, matchId: { $in: replacedIds } });
  }

  const [pending, clothesIds] = await Promise.all([
    PendingMatch.find({ userId }).lean(),
    Clothes.find({ userId }).distinct("_id"),
  ]);

  const stillOwned = new Set(clothesIds.map(String));
  const outfits = pending.filter((outfit) => outfit.clothes.every((id) => stillOwned.has(String(id))));

  for (let start = 0; start < outfits.length; start += SWAP_CHUNK_SIZE) {
    try {
      await Match.insertMany(outfits.slice(start, start + SWAP_CHUNK_SIZE), { ordered: false });
    } catch (error) {
      // Already in Match: a repeated swap, or the same as a protected outfit.
      if (!isOnlyDuplicateKeyErrors(error)) {
        throw error;
      }
    }
  }

  await PendingMatch.deleteMany({ userId });
  await Preferences.updateOne({ userId }, { $set: { outfitRebuild: null } });

  return replacedIds;
}

// Matches items until the chunk's time is up, then answers. Once the last
// item is done it swaps the new outfits in.
// { running: false } with no rebuild; { running: true, remaining, total }
// mid-way; { running: false, finished: true, replacedIds } once swapped in.
async function continueOutfitRebuild(userId) {
  const rebuild = await getOutfitRebuild(userId);

  if (!rebuild) {
    return { running: false, finished: false };
  }

  // A new outfit already gets the new range, so this only matters for the
  // ones staying.
  if (rebuild.refreshTemperatures) {
    const preferences = await Preferences.findOne({ userId }).select("gender colour temperature").lean();

    await refreshOutfitTemperatures(userId, preferences);
    await Preferences.updateOne(
      { userId, "outfitRebuild.startedAt": rebuild.startedAt },
      { $set: { "outfitRebuild.refreshTemperatures": false } }
    );
  }

  const remaining = [...rebuild.remainingItemIds];

  if (remaining.length) {
    const wardrobe = await Clothes.find({ userId });
    const itemsById = new Map(wardrobe.map((item) => [String(item._id), item]));
    const startedAt = Date.now();

    while (remaining.length) {
      if (Date.now() - startedAt > CHUNK_WORK_MS || msUntilDeadline() < DEADLINE_RESERVE_MS) {
        return { running: true, remaining: remaining.length, total: rebuild.total };
      }

      const itemId = remaining[0];
      const item = itemsById.get(String(itemId));

      // An item deleted since the rebuild started has nothing to match.
      if (item) {
        await processMatches(item, wardrobe, {
          into: PendingMatch,
          skipKeys: await keysToSkip(userId, rebuild),
        });
      }

      // Only this rebuild's list - another device may have finished it.
      await Preferences.updateOne(
        { userId, "outfitRebuild.startedAt": rebuild.startedAt },
        { $pull: { "outfitRebuild.remainingItemIds": itemId } }
      );
      remaining.shift();
    }
  }

  const replacedIds = await swapInRebuiltOutfits(userId, rebuild);

  return { running: false, finished: true, replacedIds };
}

module.exports = {
  getOutfitRebuild,
  rebuildStatus,
  startOutfitRebuild,
  replacedOutfitsFilter,
  swapInRebuiltOutfits,
  continueOutfitRebuild,
};
