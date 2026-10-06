// server/scripts/matchingOverhaulMigration.js
//
// One-off database update for the matching overhaul (see
// context/clothing-and-matching-flow.md, Parts 10-11). Run once, after the
// code changes are deployed:
//
//   node server/scripts/matchingOverhaulMigration.js
//
// It reads MONGO from server/.env, like the server does. Steps 1-3 and 5
// are safe to run again. Step 4 is NOT once the new code is live - it would
// also delete every score adjustment users have built up since.
//
//  1. Renames subtypes on existing clothes.
//  2. Changes men's Waistcoat items from outer to top.
//  3. Removes the old `style` preference.
//  4. Deletes every personal score document (they held old absolute
//     scores; the field is now an adjustment).
//  5. Reports any match without a score (there should be none).

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Clothes, Match, MatchScore, Preferences } = require("../models/AllModels.js");

const SUBTYPE_RENAMES = {
  "Demin jacket": "Denim jacket",
  "Short Turtlneck": "Short turtleneck",
  "Long-tshirt": "Long t-shirt",
};

async function renameSubtypes() {
  for (const [from, to] of Object.entries(SUBTYPE_RENAMES)) {
    const result = await Clothes.updateMany({ subtype: from }, { $set: { subtype: to } });
    console.log(`Renamed "${from}" -> "${to}": ${result.modifiedCount} item(s)`);
  }
}

async function moveMensWaistcoatsToTops() {
  const menPreferences = await Preferences.find({ gender: "man" }).select("userId");
  const menUserIds = menPreferences.map((preferences) => preferences.userId);

  const result = await Clothes.updateMany(
    { userId: { $in: menUserIds }, subtype: "Waistcoat", type: "outer" },
    { $set: { type: "top" } }
  );

  console.log(`Men's Waistcoat outer -> top: ${result.modifiedCount} item(s)`);
}

// `style` is no longer in the Preferences schema, so Mongoose would strip
// it from the update - go through the raw collection instead.
async function removeStylePreference() {
  const result = await Preferences.collection.updateMany(
    { style: { $exists: true } },
    { $unset: { style: "" } }
  );

  console.log(`Removed style from ${result.modifiedCount} preference document(s)`);
}

async function deletePersonalScores() {
  const result = await MatchScore.deleteMany({});
  console.log(`Deleted ${result.deletedCount} personal score document(s)`);
}

async function reportMatchesWithoutScore() {
  const count = await Match.countDocuments({ score: { $exists: false } });

  if (count) {
    console.warn(
      `${count} match(es) have no score. Delete them or give them one - ` +
      `the Match schema now requires it.`
    );
  } else {
    console.log("Every match has a score.");
  }
}

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    await renameSubtypes();
    await moveMensWaistcoatsToTops();
    await removeStylePreference();
    await deletePersonalScores();
    await reportMatchesWithoutScore();
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
