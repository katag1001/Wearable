// server/scripts/renameJeansSubtypes.js
//
// ONE-OFF (delete after running). The generic "Jeans" (man), "High waisted
// jeans" and "Low waist jeans" (woman/unisex) subtypes were replaced by
// specific cuts. Moves everything still saved under the old names to
// "Straight leg jeans":
//  - Clothes.subtype;
//  - MatchScore pairs (re-sorted into canonical order; if the user already
//    has a score for the new pair, that one is kept and the old one deleted);
//  - Trend pieces' subtype lists.
// Matches only store clothing ids, so they need no change.
//
//   node server/scripts/renameJeansSubtypes.js           (shows counts, changes nothing)
//   node server/scripts/renameJeansSubtypes.js --confirm (renames)
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Clothes, MatchScore, Trend } = require("../models/AllModels.js");
const { canonicalPairKey } = require("../services/matrixService.js");

const NEW_NAME = "Straight leg jeans";
const OLD_NAMES = ["Jeans", "High waisted jeans", "Low waist jeans"];

async function run() {
  await mongoose.connect(process.env.MONGO);
  const confirm = process.argv.includes("--confirm");

  try {
    for (const oldName of OLD_NAMES) {
      const count = await Clothes.countDocuments({ subtype: oldName });
      console.log(`Clothes "${oldName}": ${count}`);
    }

    const scores = await MatchScore.find({
      $or: [{ subtypeA: { $in: OLD_NAMES } }, { subtypeB: { $in: OLD_NAMES } }],
    });
    console.log(`Personal pair scores with an old name: ${scores.length}`);

    const trends = await Trend.find({ "pieces.subtype": { $in: OLD_NAMES } });
    console.log(`Trends with an old name: ${trends.length}`);

    if (!confirm) {
      console.log(`Nothing changed. Run again with --confirm to move them all to "${NEW_NAME}".`);
      return;
    }

    const clothes = await Clothes.updateMany({ subtype: { $in: OLD_NAMES } }, { $set: { subtype: NEW_NAME } });
    console.log(`Renamed ${clothes.modifiedCount} clothes.`);

    let moved = 0;
    let dropped = 0;
    for (const score of scores) {
      const rename = (name) => (OLD_NAMES.includes(name) ? NEW_NAME : name);
      const [subtypeA, subtypeB] = canonicalPairKey(rename(score.subtypeA), rename(score.subtypeB));
      const clash = await MatchScore.exists({ userId: score.userId, subtypeA, subtypeB, _id: { $ne: score._id } });

      if (clash || subtypeA === subtypeB) {
        await score.deleteOne();
        dropped += 1;
      } else {
        score.subtypeA = subtypeA;
        score.subtypeB = subtypeB;
        await score.save();
        moved += 1;
      }
    }
    console.log(`Pair scores: ${moved} renamed, ${dropped} dropped (already had one for the new pair).`);

    for (const trend of trends) {
      trend.pieces.forEach((piece) => {
        piece.subtype = [...new Set(piece.subtype.map((s) => (OLD_NAMES.includes(s) ? NEW_NAME : s)))];
      });
      await trend.save();
    }
    console.log(`Updated ${trends.length} trends.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Rename failed:", error);
  process.exit(1);
});
