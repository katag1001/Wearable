// server/scripts/rematchAll.js
//
// One-off database update: deletes EVERY match (and every Today entry, which
// points at matches) for every user, then runs processMatches for every
// clothing item so all outfits are rebuilt under the current matching rules.
// User-made and favourite matches are deleted too, unless --keep-protected
// is passed: then favourite and user-made matches (and Today entries
// pointing at them) are kept untouched, and only the rest are deleted and
// rebuilt - matching skips outfits that already exist, so kept ones aren't
// duplicated. Personal score adjustments (MatchScore) are always kept.
//
//   node server/scripts/rematchAll.js                              (shows counts, changes nothing)
//   node server/scripts/rematchAll.js --confirm                    (deletes and rematches)
//   node server/scripts/rematchAll.js --keep-protected [--confirm] (keeps favourites and user-made)
//   node server/scripts/rematchAll.js --subtype "Turtleneck jumper" --keep-protected [--confirm]
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

// Matches --keep-protected deletes: neither a favourite nor user-made.
const UNPROTECTED = { favourite: { $ne: true }, userMade: { $ne: true } };

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
async function deleteMatches(keepProtected, scope) {
  if (!keepProtected && !Object.keys(scope).length) {
    await Today.deleteMany({});
    await Match.deleteMany({});
    console.log("Deleted all matches and Today entries.");
    return;
  }

  const filter = keepProtected ? { ...UNPROTECTED, ...scope } : scope;
  const ids = await Match.find(filter).distinct("_id");
  const today = await Today.deleteMany({ matchId: { $in: ids } });
  const matches = await Match.deleteMany({ _id: { $in: ids } });
  console.log(
    `Deleted ${matches.deletedCount} matches and ${today.deletedCount} Today entries.` +
    (keepProtected ? " Favourite and user-made matches kept." : "")
  );
}

async function run() {
  const keepProtected = process.argv.includes("--keep-protected");
  const subtype = argValue("--subtype");

  await mongoose.connect(process.env.MONGO);

  try {
    const scope = subtype
      ? { clothes: { $in: await Clothes.find({ subtype }).distinct("_id") } }
      : {};

    if (subtype) console.log(`Only outfits with a ${subtype}.`);

    const [matchCount, unprotectedCount, todayCount, owners] = await Promise.all([
      Match.countDocuments(scope),
      Match.countDocuments({ ...UNPROTECTED, ...scope }),
      Today.countDocuments(),
      Clothes.distinct("userId"),
    ]);

    console.log(
      `${matchCount} matches (${matchCount - unprotectedCount} favourite/user-made), ` +
      `${todayCount} Today entries, ${owners.length} user(s) with clothes.`
    );

    if (!process.argv.includes("--confirm")) {
      console.log("Nothing changed. Run again with --confirm to delete and rematch.");
      return;
    }

    await deleteMatches(keepProtected, scope);

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
