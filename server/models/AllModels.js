const mongoose = require("mongoose");
const { clothesKey } = require("../utils/clothesKey.js");

/* -------------------- USER -------------------- */

const userSchema = new mongoose.Schema(
{
email: { type: String, unique: true, required: true },
password: { type: String, required: true },
},
{ strictQuery: false 

  });

/* -------------------- MATCH -------------------- */

const matchSchema = new mongoose.Schema({
clothes: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "Clothes",
required: true,
},
],

// The sorted clothing ids as one string (server/utils/clothesKey.js), set
// automatically from `clothes` before every save. Unique per user, so the
// same outfit can never be saved twice.
clothesKey: { type: String, required: true },

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},

colors: { type: [String], required: true },
min_temp: { type: Number, required: true },
max_temp: { type: Number, required: true },
type: { type: String, required: true },
hasOuter: { type: Boolean, default: false },

topCount: { type: Number, default: 0 },
bottomCount: { type: Number, default: 0 },
onepieceCount: { type: Number, default: 0 },
outerCount: { type: Number, default: 0 },

spring: { type: Boolean, required: true },
summer: { type: Boolean, required: true },
autumn: { type: Boolean, required: true },
winter: { type: Boolean, required: true },

styles: { type: [String], default: [] },
tags: { type: [String], required: false },

lastWornDate: { type: Date, default: null },

timesWorn: { type: Number, default: 0 },
timesWornThisYear: { type: Number, default: 0 },
wornYear: { type: Number, default: null },

userMade: { type: Boolean, default: false },
favourite: { type: Boolean, default: false },

// Scrolling past an outfit on the Today page rejects it, at most once a day
// (server/services/matchRejectionService.js).
rejectedCount: { type: Number, default: 0 },
lastRejectedDate: { type: Date, default: null },

// Set when the match is created (server/services/outfitScoreService.js
// and server/constants/scoring.js), and lowered each time it's rejected.
// A favourite is shown and sorted as 100 without changing this value.
score: {
type: Number,
required: true,
min: 0,
max: 100,
validate: { validator: Number.isInteger, message: "score must be a whole number" },
},
});

// My Outfits pages through a user's matches newest first
// (server/services/queryHelpers.js).
matchSchema.index({ userId: 1, _id: -1 });

matchSchema.index({ userId: 1, clothesKey: 1 }, { unique: true });

// Runs for save() and insertMany() alike.
matchSchema.pre("validate", function () {
  this.clothesKey = clothesKey(this.clothes);
});

/* -------------------- CLOTHES -------------------- */

const clothesSchema = new mongoose.Schema({
name: { type: String, required: true },
imageUrl: { type: String, default: "" },

cloudinaryId: {
    type: String,
    default: ""
  },

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},

// No temperature range here - only matches have one, worked out from their
// subtypes (server/services/presetTemperatureService.js).
colors: { type: [String], required: true },
styles: { type: [String], required: true },
type: { type: String, required: true },
subtype: { type: String, required: true },

lastWornDate: { type: Date, default: null },
tags: { type: [String], required: false },

timesWorn: { type: Number, default: 0 },
timesWornThisYear: { type: Number, default: 0 },
wornYear: { type: Number, default: null },

spring: { type: Boolean, required: true },
summer: { type: Boolean, required: true },
autumn: { type: Boolean, required: true },
winter: { type: Boolean, required: true },
});

// My Clothes pages through a user's items newest first
// (server/services/queryHelpers.js).
clothesSchema.index({ userId: 1, _id: -1 });

/* -------------------- TODAY -------------------- */

// One document per outfit suitable for today - a user has many. createToday
// (allControllers.js) replaces the whole set each time it runs.
const todaySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },

  dateCreated: {
    type: Date,
    default: Date.now,
  },

});

/* -------------------- PREFERENCES -------------------- */

const preferencesSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },

  monday: { type: String, default: null },
  tuesday: { type: String, default: null },
  wednesday: { type: String, default: null },
  thursday: { type: String, default: null },
  friday: { type: String, default: null },
  saturday: { type: String, default: null },
  sunday: { type: String, default: null },

  gender: { type: String, enum: ["man", "woman", "unisex"], default: null },
  colour: { type: String, enum: ["max", "mid", "min"], default: null },
  pattern: { type: String, enum: ["max", "mid", "min"], default: null },
  temperature: { type: String, enum: ["cold", "hot", "normal"], default: null },

});

/* -------------------- MATCH SCORE -------------------- */
//
// A user's personal adjustment to the score of one pair of clothing
// subtypes. The pair's score is the gender's baseline
// (server/constants/matchScoreBaseline.js) plus this adjustment, kept
// between 0 and 100. Storage is sparse - a document only exists once a user
// has built, claimed, favourited or deleted an outfit containing that pair,
// and never for a pair that can't be matched. subtypeA/subtypeB are always
// stored in a canonical (alphabetical) order - see
// matrixService.canonicalPairKey - so a pair is never split across two
// documents.

const matchScoreSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  subtypeA: { type: String, required: true },
  subtypeB: { type: String, required: true },

  adjustment: { type: Number, required: true },

});

matchScoreSchema.index(
  { userId: 1, subtypeA: 1, subtypeB: 1 },
  { unique: true }
);


/* -------------------- MODELS -------------------- */

module.exports = {
User: mongoose.model("User", userSchema),
Match: mongoose.model("Match", matchSchema),
Today: mongoose.model("Today", todaySchema),
Clothes: mongoose.model("Clothes", clothesSchema),
Preferences: mongoose.model("Preferences", preferencesSchema),
MatchScore: mongoose.model("MatchScore", matchScoreSchema),
};