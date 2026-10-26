// server/scripts/rematchAll.js
//
// Rebuilds every user's automatic outfits under the current matching rules.
// Every match the user hasn't interacted with is deleted (with the Today
// entries pointing at it), then processMatches runs for every clothing
// item. Outfits the app protects (matchProtection.js) - favourites,
// user-made, rated, worn and edited by hand - are kept untouched, and
// matching skips outfits that already exist, so they aren't duplicated.
// Personal score adjustments (MatchScore) are kept too.
//
//   node server/scripts/rematchAll.js            (shows counts, changes nothing)
//   node server/scripts/rematchAll.js --confirm  (deletes and rematches)
//   node server/scripts/rematchAll.js --subtype "Turtleneck jumper" [--confirm]
//
// --subtype limits it to one kind of item: only outfits containing an item
// of that subtype are deleted, and only those items are matched again (with
// the whole wardrobe to pair them with). Use it after changing a rule for
// one subtype, e.g. adding it to REQUIRES_LAYERING.
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Match, Today, Clothes } = require("../models/AllModels.js");
const { processMatches } = require("../services/matchService.js");
const { UNPROTECTED_MATCH_FILTER } = require("../services/matchProtection.js");

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

async function rematchUser(userId, subtype) {
  const wardrobe = await Clothes.find({ userId });
  const items = subtype ? wardrobe.filter((item) => item.subtype === subtype) : wardrobe;

  for (const [index, item] of items.entries()) {
    const started = Date.now();

    await processMatches(item, wardrobe);

    const total = await Match.countDocuments({ userId });
    console.log(
      `  ${index + 1}/${items.length} ${item.name} (${item.subtype}) - ` +
      `${Date.now() - started}ms, ${total} matches so far`
    );
  }
}

// `scope` is {} for every match, or the --subtype filter.
async function deleteMatches(scope) {
  const ids = await Match.find({ ...UNPROTECTED_MATCH_FILTER, ...scope }).distinct("_id");
  const today = await Today.deleteMany({ matchId: { $in: ids } });
  const matches = await Match.deleteMany({ _id: { $in: ids } });
  console.log(
    `Deleted ${matches.deletedCount} matches and ${today.deletedCount} Today entries. ` +
    "Favourite, user-made, rated, worn and hand-edited matches kept."
  );
}

async function run() {
  const subtype = argValue("--subtype");

  await mongoose.connect(process.env.MONGO);

  try {
    const scope = subtype
      ? { clothes: { $in: await Clothes.find({ subtype }).distinct("_id") } }
      : {};

    if (subtype) console.log(`Only outfits with a ${subtype}.`);

    const [matchCount, deleteCount, todayCount, owners] = await Promise.all([
      Match.countDocuments(scope),
      Match.countDocuments({ ...UNPROTECTED_MATCH_FILTER, ...scope }),
      Today.countDocuments(),
      Clothes.distinct("userId"),
    ]);

    console.log(
      `${matchCount} matches (${deleteCount} to delete, ${matchCount - deleteCount} to keep), ` +
      `${todayCount} Today entries, ${owners.length} user(s) with clothes.`
    );

    if (!process.argv.includes("--confirm")) {
      console.log("Nothing changed. Run again with --confirm to delete and rematch.");
      return;
    }

    await deleteMatches(scope);

    for (const userId of owners) {
      console.log(`Rematching user ${userId}:`);
      await rematchUser(userId, subtype);
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
