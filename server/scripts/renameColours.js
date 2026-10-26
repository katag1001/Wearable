// server/scripts/renameColours.js
//
// One-off database update for the colour split (October 2026): renames the
// colours stored on clothing items, footwear and matches - Yellow becomes
// Bright Yellow, Pink becomes Baby Pink and Deep Red becomes Dark Red - and
// takes palette ids that no longer exist out of users' favourite palettes.
// Butter Yellow, Bright Pink and Maroon are new, so nothing is renamed to
// them; items that should be one of them need changing by hand.
//
//   node server/scripts/renameColours.js            (shows counts, changes nothing)
//   node server/scripts/renameColours.js --confirm  (renames)
//
// Safe to run again: renamed colours are no longer found. Run it before
// rematchAll.js, so the matching sees the new names.
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Clothes, Footwear, Match, Preferences } = require("../models/AllModels.js");
const { allPalettes } = require("../utils/colorPalettes.js");

const RENAMES = {
  Yellow: "Bright Yellow",
  Pink: "Baby Pink",
  "Deep Red": "Dark Red",
};

const MODELS = { Clothes, Footwear, Match };

// Renames each old colour in `colors`, in place - updateMany with the
// positional $[] operator, one rename at a time.
async function renameIn(Model, confirm) {
  const counts = {};

  for (const [from, to] of Object.entries(RENAMES)) {
    const filter = { colors: from };

    if (!confirm) {
      counts[from] = await Model.countDocuments(filter);
      continue;
    }

    const result = await Model.updateMany(
      filter,
      { $set: { "colors.$[old]": to } },
      { arrayFilters: [{ old: from }] }
    );
    counts[from] = result.modifiedCount;
  }

  return counts;
}

async function run() {
  const confirm = process.argv.includes("--confirm");

  await mongoose.connect(process.env.MONGO);

  try {
    for (const [name, Model] of Object.entries(MODELS)) {
      const counts = await renameIn(Model, confirm);
      const summary = Object.entries(counts).map(([from, n]) => `${from} → ${RENAMES[from]}: ${n}`).join(", ");
      console.log(`${name}: ${summary}`);
    }

    const knownIds = allPalettes.map((palette) => palette.id);
    const staleFilter = { favouritePalettes: { $elemMatch: { $nin: knownIds } } };

    if (confirm) {
      const result = await Preferences.updateMany(staleFilter, { $pull: { favouritePalettes: { $nin: knownIds } } });
      console.log(`Preferences: removed deleted palettes from ${result.modifiedCount} user(s)' favourites.`);
    } else {
      console.log(`Preferences: ${await Preferences.countDocuments(staleFilter)} user(s) have a deleted palette as a favourite.`);
      console.log("Nothing changed. Run again with --confirm to rename.");
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
