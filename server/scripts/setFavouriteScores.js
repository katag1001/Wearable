// server/scripts/setFavouriteScores.js
//
// One-off, for the switch to favouriting setting an outfit's stored score
// (services/matchRatingService.js). Favourites used to be ranked as 100
// while keeping their old automatic score; now the stored score is used
// everywhere, so every existing favourite is set to FAVOURITE_OUTFIT_SCORE
// (with no favourite-item bonus) to keep its place. Ratings are untouched.
//
// Also drops the old { userId, favourite, score, _id } index on matches,
// replaced by { userId, score, _id } now that favourites don't sort first.
//
//   node server/scripts/setFavouriteScores.js           (shows counts, changes nothing)
//   node server/scripts/setFavouriteScores.js --confirm (saves)
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Match } = require("../models/AllModels.js");
const { FAVOURITE_OUTFIT_SCORE } = require("../constants/scoring.js");

const OLD_INDEX = "userId_1_favourite_-1_score_-1__id_-1";

const toChange = {
  favourite: true,
  $or: [
    { score: { $ne: FAVOURITE_OUTFIT_SCORE } },
    { favouriteItemBonus: { $nin: [0, null] } },
  ],
};

async function run() {
  await mongoose.connect(process.env.MONGO);

  try {
    const [favourites, changing, indexes] = await Promise.all([
      Match.countDocuments({ favourite: true }),
      Match.countDocuments(toChange),
      Match.collection.indexes(),
    ]);
    const hasOldIndex = indexes.some((index) => index.name === OLD_INDEX);

    console.log(
      `${favourites} favourite(s), ${changing} not yet at ${FAVOURITE_OUTFIT_SCORE}. ` +
      `Old index ${hasOldIndex ? "present" : "already gone"}.`
    );

    if (!process.argv.includes("--confirm")) {
      console.log("Nothing changed. Run again with --confirm to save.");
      return;
    }

    const { modifiedCount } = await Match.updateMany(toChange, {
      $set: { score: FAVOURITE_OUTFIT_SCORE, favouriteItemBonus: 0 },
    });
    console.log(`Set ${modifiedCount} favourite(s) to ${FAVOURITE_OUTFIT_SCORE}.`);

    if (hasOldIndex) {
      await Match.collection.dropIndex(OLD_INDEX);
      console.log(`Dropped index ${OLD_INDEX}. The server builds the new one when it starts.`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});
