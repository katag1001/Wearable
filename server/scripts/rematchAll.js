// server/scripts/rematchAll.js
//
// One-off database update: deletes EVERY match (and every Today entry, which
// points at matches) for every user, then runs processMatches for every
// clothing item so all outfits are rebuilt under the current matching rules.
// User-made and favourite matches are deleted too. Personal score
// adjustments (MatchScore) are kept.
//
//   node server/scripts/rematchAll.js            (shows counts, changes nothing)
//   node server/scripts/rematchAll.js --confirm  (deletes and rematches)
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Match, Today, Clothes } = require("../models/AllModels.js");
const { processMatches } = require("../services/matchService.js");

async function rematchUser(userId) {
  const wardrobe = await Clothes.find({ userId });

  for (const [index, item] of wardrobe.entries()) {
    const started = Date.now();

    await processMatches(item, wardrobe);

    const total = await Match.countDocuments({ userId });
    console.log(
      `  ${index + 1}/${wardrobe.length} ${item.name} (${item.subtype}) - ` +
      `${Date.now() - started}ms, ${total} matches so far`
    );
  }
}

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    const [matchCount, todayCount, owners] = await Promise.all([
      Match.countDocuments(),
      Today.countDocuments(),
      Clothes.distinct("userId"),
    ]);

    console.log(`${matchCount} matches, ${todayCount} Today entries, ${owners.length} user(s) with clothes.`);

    if (!process.argv.includes("--confirm")) {
      console.log("Nothing changed. Run again with --confirm to delete and rematch.");
      return;
    }

    await Today.deleteMany({});
    await Match.deleteMany({});
    console.log("Deleted all matches and Today entries.");

    for (const userId of owners) {
      console.log(`Rematching user ${userId}:`);
      await rematchUser(userId);
    }

    console.log(`Done: ${await Match.countDocuments()} matches.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
