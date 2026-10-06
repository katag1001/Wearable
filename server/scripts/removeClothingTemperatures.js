// server/scripts/removeClothingTemperatures.js
//
// One-off database update: clothing items no longer have a temperature
// range (only matches do), so this removes min_temp/max_temp from every
// existing clothing document. Safe to run again - a second run changes
// nothing.
//
//   node server/scripts/removeClothingTemperatures.js
//   node server/scripts/removeClothingTemperatures.js --backup <file.json>
//
// --backup writes every item's current range to a JSON file first. Reads
// MONGO from server/.env, like the server does.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Clothes } = require("../models/AllModels.js");

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

async function run() {
  const backupFile = argValue("--backup");

  await mongoose.connect(process.env.MONGO);

  try {
    // The fields are no longer in the Clothes schema, so Mongoose would
    // strip them from queries and updates - use the raw collection.
    const withTemperatures = { $or: [{ min_temp: { $exists: true } }, { max_temp: { $exists: true } }] };

    if (backupFile) {
      const docs = await Clothes.collection
        .find(withTemperatures, { projection: { min_temp: 1, max_temp: 1 } })
        .toArray();
      fs.writeFileSync(backupFile, JSON.stringify(docs, null, 2));
      console.log(`Backed up ${docs.length} item range(s) to ${backupFile}`);
    }

    const result = await Clothes.collection.updateMany(withTemperatures, {
      $unset: { min_temp: "", max_temp: "" },
    });

    console.log(`Removed the temperature range from ${result.modifiedCount} clothing item(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});
