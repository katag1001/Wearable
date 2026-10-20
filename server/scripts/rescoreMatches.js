// server/scripts/rescoreMatches.js
//
// Recalculates the score and temperature range of every existing match
// under the current numbers (constants/scoring.js, the matrix files,
// constants/temperatureGroups.js), without rematching - no outfit is
// added or deleted, even one that would no longer be suggested today.
//
//  - Favourites are skipped entirely (score and range).
//  - Worn outfits are recalculated like any other.
//  - User-made outfits keep their score (it's a flat USER_MADE_SCORE) but
//    get a new range.
//  - Automatic outfits get a fresh computeOutfitScore, minus
//    REJECTION_SCORE_PENALTY for every rejection still on record, so
//    rejections aren't forgotten, then the favourite-item bonus
//    (services/favouriteItemService.js) if any of their clothes is a
//    favourite.
//  - Ranges edited by hand on a match card are overwritten, as with
//    resetMatchTemperatures.js.
//
//   node server/scripts/rescoreMatches.js                          (shows changes, saves nothing)
//   node server/scripts/rescoreMatches.js --confirm --backup <file.json>
//
// --backup writes every changed match's current score and range to a JSON
// file before saving. Reads MONGO from server/.env, like the server does.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Match } = require("../models/AllModels.js");
const { computePresetTemperatureRange } = require("../services/presetTemperatureService.js");
const { computeOutfitScore } = require("../services/outfitScoreService.js");
const { buildMatchingContext } = require("../services/matchService.js");
const {
  getUserMatchingPreferences,
  loadUserAdjustments,
} = require("../services/matchScoreService.js");
const { MIN_SCORE, REJECTION_SCORE_PENALTY } = require("../constants/scoring.js");
const { favouriteItemBonusFor } = require("../services/favouriteItemService.js");

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

async function loadUserContext(userId) {
  const [preferences, adjustments] = await Promise.all([
    getUserMatchingPreferences(userId),
    loadUserAdjustments(userId),
  ]);

  return buildMatchingContext({ ...preferences, adjustments });
}

async function run() {
  const confirm = process.argv.includes("--confirm");
  const backupFile = argValue("--backup");

  await mongoose.connect(process.env.MONGO);

  try {
    const matches = await Match.find({ favourite: { $ne: true } })
      .populate("clothes", "type subtype colors styles favourite");
    const favouriteCount = await Match.countDocuments({ favourite: true });

    const contexts = new Map();
    const changes = [];

    for (const match of matches) {
      const userKey = String(match.userId);

      if (!contexts.has(userKey)) {
        contexts.set(userKey, await loadUserContext(match.userId));
      }

      const context = contexts.get(userKey);
      const items = match.clothes.filter(Boolean);

      const { min_temp, max_temp } = computePresetTemperatureRange(items, context.temperaturePreference);

      const baseScore = match.userMade
        ? match.score
        : Math.max(
          MIN_SCORE,
          computeOutfitScore(items, context) -
            (match.rejectedCount || 0) * REJECTION_SCORE_PENALTY
        );

      const favouriteItemBonus =
        !match.userMade && items.some((item) => item.favourite)
          ? favouriteItemBonusFor(baseScore)
          : 0;

      const score = baseScore + favouriteItemBonus;

      if (
        score === match.score &&
        favouriteItemBonus === (match.favouriteItemBonus || 0) &&
        min_temp === match.min_temp &&
        max_temp === match.max_temp
      ) {
        continue;
      }

      const outfit = items.map((item) => item.subtype).join(" + ");
      const worn = match.timesWorn ? " (worn)" : "";
      const userMade = match.userMade ? " (user-made)" : "";
      console.log(
        `score ${String(match.score).padStart(3)} -> ${String(score).padEnd(3)} ` +
        `temp ${match.min_temp}-${match.max_temp} -> ${min_temp}-${max_temp}  ${outfit}${worn}${userMade}`
      );

      changes.push({ match, score, favouriteItemBonus, min_temp, max_temp });
    }

    console.log(
      `${changes.length} of ${matches.length} match(es) would change. ` +
      `${favouriteCount} favourite(s) skipped.`
    );

    if (!confirm) {
      console.log("Nothing saved. Run again with --confirm to save.");
      return;
    }

    if (backupFile) {
      const backup = changes.map(({ match }) => ({
        _id: String(match._id),
        score: match.score,
        favouriteItemBonus: match.favouriteItemBonus || 0,
        min_temp: match.min_temp,
        max_temp: match.max_temp,
      }));
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`Backed up ${backup.length} match(es) to ${backupFile}`);
    }

    if (changes.length) {
      const result = await Match.bulkWrite(
        changes.map(({ match, score, favouriteItemBonus, min_temp, max_temp }) => ({
          updateOne: {
            filter: { _id: match._id },
            update: { $set: { score, favouriteItemBonus, min_temp, max_temp } },
          },
        }))
      );
      console.log(`Updated ${result.modifiedCount} of ${changes.length} match(es).`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Rescore failed:", error);
  process.exit(1);
});
