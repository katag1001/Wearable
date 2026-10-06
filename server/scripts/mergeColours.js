// server/scripts/mergeColours.js
//
// One-off database update: Beige was merged into Cream and Lavender into
// Lilac, so existing clothing items and matches are updated to match.
// Duplicates are removed (an item that had both Beige and Cream ends up
// with Cream once). An item left with a single colour becomes Plain, the
// same rule the add/edit form uses. Safe to run again.
//
//   node server/scripts/mergeColours.js
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Clothes, Match } = require("../models/AllModels.js");

const MERGED_COLOURS = {
  Beige: "Cream",
  Lavender: "Lilac",
};

const OLD_COLOURS = Object.keys(MERGED_COLOURS);

function mergeColours(colors) {
  return [...new Set(colors.map((color) => MERGED_COLOURS[color] || color))];
}

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    const clothes = await Clothes.find({ colors: { $in: OLD_COLOURS } });

    for (const item of clothes) {
      const colors = mergeColours(item.colors);
      const update = { colors };

      if (colors.length < 2) {
        update.styles = ["Plain"];
      }

      await Clothes.updateOne({ _id: item._id }, { $set: update });
      console.log(`Item "${item.name}": ${item.colors.join(", ")} -> ${colors.join(", ")}`);
    }

    const matches = await Match.find({ colors: { $in: OLD_COLOURS } }).select("colors");

    if (matches.length) {
      await Match.bulkWrite(
        matches.map((match) => ({
          updateOne: {
            filter: { _id: match._id },
            update: { $set: { colors: mergeColours(match.colors) } },
          },
        }))
      );
    }

    console.log(`Updated ${clothes.length} clothing item(s) and ${matches.length} match(es).`);

    const left =
      (await Clothes.countDocuments({ colors: { $in: OLD_COLOURS } })) +
      (await Match.countDocuments({ colors: { $in: OLD_COLOURS } }));
    console.log(`Documents still using ${OLD_COLOURS.join("/")}: ${left}`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});
