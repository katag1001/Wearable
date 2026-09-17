const mongoose = require("mongoose");

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

min_temp: { type: Number, required: true },
max_temp: { type: Number, required: true },
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

/* -------------------- TODAY -------------------- */

const todaySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
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
  style: { type: String, enum: ["fun", "classic", "fashion", "all"], default: null },
  colour: { type: String, enum: ["max", "mid", "min"], default: null },
  pattern: { type: String, enum: ["max", "mid", "min"], default: null },
  temperature: { type: String, enum: ["cold", "hot", "normal"], default: null },

});

/* -------------------- MATCH SCORE -------------------- */
//
// A user's personal compatibility score for one pair of clothing subtypes.
// Storage is sparse - a document only exists once a user has created or
// deleted an outfit containing that pair. Any pair with no document here
// falls back to the shared gender+style baseline in
// api/constants/matchScoreBaseline.js. subtypeA/subtypeB are always stored
// in a canonical (alphabetical) order - see matrixService.canonicalPairKey -
// so a pair is never split across two documents.

const matchScoreSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  subtypeA: { type: String, required: true },
  subtypeB: { type: String, required: true },

  score: { type: Number, required: true },

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