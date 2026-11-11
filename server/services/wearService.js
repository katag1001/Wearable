// server/services/wearService.js
//
// Counting a wear: an outfit, its clothes or a shoe worn on a day. Used by
// "worn today" (allControllers.updateMatch), the shoe box
// (footwearControllers.wearFootwear) and planned days turning into worn
// ones (planService.js).
//
// timesWorn goes up by one; timesWornThisYear counts within the wear's
// year (starting again at 1 in a new year). lastWornDate only ever moves
// forward - a passed planned day marked worn later can't make a more
// recent wear look older.

const { Clothes } = require("../models/AllModels.js");

// The later of two dates (either may be missing).
const laterDate = (a, b) => {
  if (!a) return b ?? null;
  if (!b) return a;

  return new Date(a) >= new Date(b) ? a : b;
};

// Counts one wear on `doc` (a match or shoe, changed in place - save it
// afterwards).
const countWear = (doc, wornDate) => {
  const wornYear = new Date(wornDate).getFullYear();

  doc.lastWornDate = laterDate(doc.lastWornDate, new Date(wornDate));
  doc.timesWorn = (doc.timesWorn || 0) + 1;
  doc.timesWornThisYear =
    doc.wornYear === wornYear ? (doc.timesWornThisYear || 0) + 1 : 1;
  doc.wornYear = wornYear;
};

// Counts one wear on each of the user's clothing items.
const wearClothes = (userId, clothesIds, wornDate) => {
  const date = new Date(wornDate);
  const wornYear = date.getFullYear();

  return Clothes.updateMany(
    { _id: { $in: clothesIds }, userId },
    [
      {
        $set: {
          lastWornDate: {
            $cond: [
              { $gt: [{ $ifNull: ["$lastWornDate", null] }, date] },
              "$lastWornDate",
              date,
            ],
          },

          timesWorn: {
            $add: [{ $ifNull: ["$timesWorn", 0] }, 1],
          },

          timesWornThisYear: {
            $cond: [
              { $eq: ["$wornYear", wornYear] },
              { $add: [{ $ifNull: ["$timesWornThisYear", 0] }, 1] },
              1,
            ],
          },

          wornYear,
        },
      },
    ],
    { updatePipeline: true }
  );
};

// The wear values of a match, clothing item or shoe - the "before" copy
// the app keeps to undo a wear (core/today/wornSnapshot.js).
const wornValuesOf = (doc) => ({
  lastWornDate: doc.lastWornDate ?? null,
  timesWorn: doc.timesWorn ?? 0,
  timesWornThisYear: doc.timesWornThisYear ?? 0,
  wornYear: doc.wornYear ?? null,
});

module.exports = { laterDate, countWear, wearClothes, wornValuesOf };
