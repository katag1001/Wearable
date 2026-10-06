// server/scripts/replaceWomensChinos.js
//
// One-off database update: Chinos is no longer a women's subtype, so any
// woman's clothing item saved as Chinos becomes Cropped trousers. Men's and
// unisex Chinos are untouched. Safe to run again.
//
//   node server/scripts/replaceWomensChinos.js
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Clothes, Preferences } = require("../models/AllModels.js");

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    const women = await Preferences.find({ gender: "woman" }).select("userId");

    const result = await Clothes.updateMany(
      { userId: { $in: women.map((doc) => doc.userId) }, subtype: "Chinos" },
      { $set: { subtype: "Cropped trousers" } }
    );

    console.log(`Changed ${result.modifiedCount} women's Chinos item(s) to Cropped trousers.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});
