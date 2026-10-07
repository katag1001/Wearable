// server/scripts/addMatchClothesKey.js
//
// One-off database update: gives every existing match its clothesKey (the
// sorted clothing ids as one string, server/utils/clothesKey.js) and builds
// the unique { userId, clothesKey } index. Run it before deploying the code
// that requires clothesKey. Safe to run again.
//
// If a user already has the same outfit saved twice, nothing is changed:
// the duplicates are listed and the script stops, so you can decide which
// copy to keep.
//
//   node server/scripts/addMatchClothesKey.js
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Match } = require("../models/AllModels.js");
const { clothesKey } = require("../utils/clothesKey.js");

function findDuplicates(matches) {
  const seen = new Map();
  const duplicates = [];

  matches.forEach((match) => {
    const key = `${match.userId} ${clothesKey(match.clothes)}`;

    if (seen.has(key)) {
      duplicates.push([seen.get(key), match._id]);
    } else {
      seen.set(key, match._id);
    }
  });

  return duplicates;
}

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    const matches = await Match.find({}).select("userId clothes clothesKey").lean();
    const duplicates = findDuplicates(matches);

    if (duplicates.length) {
      console.error(`${duplicates.length} duplicate outfit(s) found - nothing changed:`);
      duplicates.forEach(([kept, extra]) => console.error(`  ${kept} and ${extra}`));
      process.exitCode = 1;
      return;
    }

    const updates = matches
      .filter((match) => match.clothesKey !== clothesKey(match.clothes))
      .map((match) => ({
        updateOne: {
          filter: { _id: match._id },
          update: { $set: { clothesKey: clothesKey(match.clothes) } },
        },
      }));

    if (updates.length) {
      await Match.bulkWrite(updates, { ordered: false });
    }

    console.log(`Set clothesKey on ${updates.length} of ${matches.length} match(es).`);

    await Match.createIndexes();
    console.log("Unique { userId, clothesKey } index is in place.");
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});
