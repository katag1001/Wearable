// server/scripts/removeLayeringViolations.js
//
// Re-checks every match against the current single-item layering rules
// (constants/requiresLayering.js) - e.g. a Warm jumper that's the only top.
// Matching only applies those rules to new outfits, so run this after
// adding a subtype to REQUIRES_LAYERING or REQUIRES_TOP.
//
// Breaking matches are deleted without lowering any pair scores (it's a
// clean-up, not the user disliking the outfit), along with any Today entries
// pointing at them. Protected matches - favourite, user-made or ever worn,
// as in matchRefreshService - are kept and listed.
//
//   node server/scripts/removeLayeringViolations.js           (lists them, changes nothing)
//   node server/scripts/removeLayeringViolations.js --confirm (deletes them)
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Match, Today, Preferences } = require("../models/AllModels.js");
const { getLayeringRules } = require("../constants/requiresLayering.js");
const { satisfiesLayeringRules } = require("../services/matrixService.js");
const { isProtectedMatch } = require("../services/matchRefreshService.js");
const { deleteMatchesWithoutScoring } = require("../services/matchLifecycleService.js");

const DEFAULT_GENDER = "woman";

async function run() {
  const confirm = process.argv.includes("--confirm");

  await mongoose.connect(process.env.MONGO);

  try {
    const matches = await Match.find().populate("clothes", "type subtype");
    const preferences = await Preferences.find().select("userId gender");
    const genderByUser = new Map(preferences.map((doc) => [String(doc.userId), doc.gender]));

    const toDelete = [];
    const kept = [];

    matches.forEach((match) => {
      const items = match.clothes.filter(Boolean);
      const gender = genderByUser.get(String(match.userId)) || DEFAULT_GENDER;

      if (satisfiesLayeringRules(items, getLayeringRules(gender))) return;

      const outfit = items.map((item) => item.subtype).join(" + ");
      (isProtectedMatch(match) ? kept : toDelete).push({ id: match._id, outfit });
    });

    toDelete.forEach(({ outfit }) => console.log(`  delete  ${outfit}`));
    kept.forEach(({ outfit }) => console.log(`  keep    ${outfit}  (favourite, user-made or worn)`));
    console.log(`${toDelete.length} match(es) break the layering rules, ${kept.length} protected kept.`);

    if (!confirm) {
      console.log("Nothing changed. Run again with --confirm to delete them.");
      return;
    }

    const ids = toDelete.map(({ id }) => id);
    const today = await Today.deleteMany({ matchId: { $in: ids } });
    const { deletedCount } = await deleteMatchesWithoutScoring({ _id: { $in: ids } });
    console.log(`Deleted ${deletedCount} match(es) and ${today.deletedCount} Today entr(ies).`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Clean-up failed:", error);
  process.exit(1);
});
