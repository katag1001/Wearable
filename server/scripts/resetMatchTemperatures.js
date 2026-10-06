// server/scripts/resetMatchTemperatures.js
//
// Recalculates every match's min_temp/max_temp from the preset temperature
// rules (services/presetTemperatureService.js, numbers in
// constants/temperatureGroups.js). New matches get their range this way
// automatically - run this after changing the numbers so existing matches
// follow them too. Note it also overwrites any range edited by hand on a
// match card.
//
//   node server/scripts/resetMatchTemperatures.js --dry-run
//   node server/scripts/resetMatchTemperatures.js --backup <file.json>
//
// --dry-run prints the changes without saving anything. --backup writes
// every match's current range to a JSON file before changing it. Reads
// MONGO from server/.env, like the server does.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Match, Preferences } = require("../models/AllModels.js");
const { computePresetTemperatureRange } = require("../services/presetTemperatureService.js");

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  const backupFile = argValue("--backup");

  await mongoose.connect(process.env.MONGO);

  try {
    const matches = await Match.find().populate("clothes", "type subtype");
    const preferences = await Preferences.find().select("userId temperature");
    const temperatureByUser = new Map(
      preferences.map((doc) => [String(doc.userId), doc.temperature])
    );

    if (backupFile && !dryRun) {
      const backup = matches.map((match) => ({
        _id: String(match._id),
        min_temp: match.min_temp,
        max_temp: match.max_temp,
      }));
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`Backed up ${backup.length} match range(s) to ${backupFile}`);
    }

    const operations = [];

    matches.forEach((match) => {
      const items = match.clothes.filter(Boolean);
      const preference = temperatureByUser.get(String(match.userId)) || null;
      const { min_temp, max_temp, unknownSubtypes } = computePresetTemperatureRange(items, preference);

      const outfit = items.map((item) => item.subtype).join(" + ");
      const unknown = unknownSubtypes.length ? `  (no preset for: ${unknownSubtypes.join(", ")})` : "";
      console.log(
        `${String(match.min_temp).padStart(5)} to ${String(match.max_temp).padEnd(5)} -> ` +
        `${String(min_temp).padStart(3)} to ${String(max_temp).padEnd(3)}  ${outfit}${unknown}`
      );

      operations.push({
        updateOne: {
          filter: { _id: match._id },
          update: { $set: { min_temp, max_temp } },
        },
      });
    });

    if (dryRun) {
      console.log(`Dry run - ${operations.length} match(es) would be updated. Nothing saved.`);
    } else if (operations.length) {
      // updateOne with $set only touches these two fields, so matches
      // created before `score` existed aren't rejected by schema validation.
      const result = await Match.bulkWrite(operations);
      console.log(`Updated ${result.modifiedCount} of ${operations.length} match(es).`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
