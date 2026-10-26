// server/scripts/resetToday.js
//
// Clears every user's Today list so it's built again from scratch - e.g.
// after rematchAll.js, to see what Today picks under the new rules. The server doesn't know anyone's location,
// so it can't rebuild the list itself: the next time the app loads, it
// sends its weather to /today/create (core/today/createTodayOnce.js), which
// finds no list for today and builds a new one.
//
// Only the Today entries go - matches, worn history, rejections and scores
// are untouched. An outfit marked as worn today stays worn.
//
//   node server/scripts/resetToday.js           (shows counts, changes nothing)
//   node server/scripts/resetToday.js --confirm (clears the lists)
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Today } = require("../models/AllModels.js");

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    const [entries, users] = await Promise.all([
      Today.countDocuments(),
      Today.distinct("userId"),
    ]);

    console.log(`${entries} Today entries for ${users.length} user(s).`);

    if (!process.argv.includes("--confirm")) {
      console.log("Nothing changed. Run again with --confirm to clear them.");
      return;
    }

    const { deletedCount } = await Today.deleteMany({});
    console.log(`Deleted ${deletedCount} Today entries. Reload the app to build today's list again.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
