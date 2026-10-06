// server/scripts/renameWideLegTrousers.js
//
// One-off database update: renames the subtype "Wideleg trousers" to
// "Wide leg trousers" on clothing items and on personal score adjustments
// (MatchScore stores subtype names). Matches only store clothing ids, so
// they need no change. Safe to run again.
//
//   node server/scripts/renameWideLegTrousers.js
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Clothes, MatchScore } = require("../models/AllModels.js");
const { canonicalPairKey } = require("../services/matrixService.js");

const OLD_NAME = "Wideleg trousers";
const NEW_NAME = "Wide leg trousers";

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    const clothes = await Clothes.updateMany({ subtype: OLD_NAME }, { $set: { subtype: NEW_NAME } });
    console.log(`Renamed ${clothes.modifiedCount} clothing item(s).`);

    // Pairs are stored in alphabetical order, and the new name can sort
    // differently from the old one, so each pair is re-ordered as it's
    // renamed.
    const scores = await MatchScore.find({ $or: [{ subtypeA: OLD_NAME }, { subtypeB: OLD_NAME }] });

    for (const doc of scores) {
      const rename = (subtype) => (subtype === OLD_NAME ? NEW_NAME : subtype);
      const [subtypeA, subtypeB] = canonicalPairKey(rename(doc.subtypeA), rename(doc.subtypeB));

      await MatchScore.updateOne({ _id: doc._id }, { $set: { subtypeA, subtypeB } });
    }

    console.log(`Renamed ${scores.length} personal score adjustment(s).`);

    const left =
      (await Clothes.countDocuments({ subtype: OLD_NAME })) +
      (await MatchScore.countDocuments({ $or: [{ subtypeA: OLD_NAME }, { subtypeB: OLD_NAME }] }));
    console.log(`Documents still using "${OLD_NAME}": ${left}`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Rename failed:", error);
  process.exit(1);
});
