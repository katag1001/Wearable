const mongoose = require("mongoose");
const { clothesKey } = require("../utils/clothesKey.js");
const { PATTERNS, PLAIN } = require("../constants/patternRules.js");
const FABRICS = require("../../shared/fabrics.json").map(({ name }) => name);

/* -------------------- ITEM ANALYSIS -------------------- */

// How a clothing item or pair of footwear was filled in from its photo
// (services/itemAnalysisService.js): the model, the prompt version and
// Gemini's own answer, kept as it was even after the user edits the item -
// so the answer can be compared with what the user kept. None for items
// added by hand.
const analysisSchema = new mongoose.Schema(
{
model: { type: String },
promptVersion: { type: String },
analysedAt: { type: Date },
answer: { type: mongoose.Schema.Types.Mixed },
},
{ _id: false }
);

/* -------------------- USER -------------------- */

const userSchema = new mongoose.Schema(
{
email: { type: String, unique: true, required: true },
password: { type: String, required: true },
// What the apps greet the user by ("Hey Katy"). Not unique. Accounts made
// before sign-up asked for it have none.
firstName: { type: String, trim: true, maxlength: 50 },
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
// min_temp/max_temp are without tights. True when the outfit's items allow
// tights, which suits a range colder by shared/tights.json's shift
// (services/tightsService.js). Set with the range.
tights: { type: Boolean, default: false },
// "Not with tights in this outfit", set by the user (Today's broken heart
// or the outfit's edit page). The outfit takes tights only when `tights`
// is true and this isn't.
noTights: { type: Boolean, default: false },
type: { type: String, required: true },
hasOuter: { type: Boolean, default: false },

topCount: { type: Number, default: 0 },
bottomCount: { type: Number, default: 0 },
onepieceCount: { type: Number, default: 0 },
outerCount: { type: Number, default: 0 },

// The seasons the outfit belongs to, from its fabrics, colours, types and
// temperature range (services/seasonalityService.js outfitSeasonFlags) -
// for the Outfits page season buttons and filter.
spring: { type: Boolean, required: true },
summer: { type: Boolean, required: true },
autumn: { type: Boolean, required: true },
winter: { type: Boolean, required: true },

// Every item's pattern (services/outfitEvaluator.js describeOutfit).
patterns: { type: [String], default: [] },
tags: { type: [String], required: false },

lastWornDate: { type: Date, default: null },

timesWorn: { type: Number, default: 0 },
timesWornThisYear: { type: Number, default: 0 },
wornYear: { type: Number, default: null },

userMade: { type: Boolean, default: false },
favourite: { type: Boolean, default: false },
// True once the user has changed anything on the outfit by hand (edit page,
// too hot / too cold, not with tights). Like favourites, user-made and worn
// outfits, it's never deleted or re-scored by the app's automatic
// rematching (services/matchProtection.js).
userEdited: { type: Boolean, default: false },

// Scrolling past an outfit on the Today page rejects it, at most once a day
// (server/services/matchRejectionService.js).
rejectedCount: { type: Number, default: 0 },
lastRejectedDate: { type: Date, default: null },

// The user's 1-5 star rating, or null if not rated
// (server/services/matchRatingService.js).
rating: { type: Number, min: 1, max: 5, default: null },

// Set when the match is created (server/services/outfitScoreService.js
// and server/constants/scoring.js) and lowered each time it's rejected.
// Rating or favouriting the outfit sets it outright
// (server/services/matchRatingService.js). Favourite items and palettes
// never change it - they only add points on Today
// (services/todayScoreService.js).
score: {
type: Number,
required: true,
min: 0,
max: 100,
validate: { validator: Number.isInteger, message: "score must be a whole number" },
},
});

// My Outfits pages through a user's matches highest score first
// (HIGHEST_SCORE_FIRST in server/services/queryHelpers.js).
matchSchema.index({ userId: 1, score: -1, _id: -1 });

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

// The shown image (above) is the photo with its background removed. A
// small copy for grids, and the photo as uploaded - see
// services/imageService.js, which deletes all three together.
thumbnailUrl: { type: String, default: "" },
thumbnailCloudinaryId: { type: String, default: "" },
originalImageUrl: { type: String, default: "" },
originalCloudinaryId: { type: String, default: "" },

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},

// No temperature range here - only matches have one, worked out from their
// subtypes (server/services/presetTemperatureService.js).
colors: { type: [String], required: true },
// One of shared/patterns.json. Items saved before this field existed have
// none and are read as Plain.
pattern: { type: String, enum: PATTERNS, default: PLAIN },
type: { type: String, required: true },
subtype: { type: String, required: true },

lastWornDate: { type: Date, default: null },
tags: { type: [String], required: false },

timesWorn: { type: Number, default: 0 },
timesWornThisYear: { type: Number, default: 0 },
wornYear: { type: Number, default: null },

// The main fabric (shared/fabrics.json), "" until it's known. Seasonal
// fabrics decide which seasons the item's outfits belong to
// (services/seasonalityService.js).
fabric: {
  type: String,
  default: "",
  validate: {
    validator: (value) => value === "" || FABRICS.includes(value),
    message: "fabric must be one of shared/fabrics.json",
  },
},

// Outfits with a favourite item score FAVOURITE_ITEM_BONUS higher on Today
// (services/todayScoreService.js) - their saved score doesn't change.
favourite: { type: Boolean, default: false },

// Items the user marked as a mismatch with this one on the Today page.
// Stored on both items; automatic matching never pairs them
// (server/services/mismatchService.js). Outfits the user builds ignore it.
mismatchedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "Clothes" }],

// "Would you wear this with tights?" from the item form - only asked for
// the skirts, dresses and shorts in shared/tights.json. Unset means that
// list's default (server/services/tightsService.js).
wearWithTights: { type: Boolean },

analysis: { type: analysisSchema, default: undefined },
});

// My Clothes pages through a user's items newest first
// (server/services/queryHelpers.js).
clothesSchema.index({ userId: 1, _id: -1 });

/* -------------------- TODAY -------------------- */

// One document per outfit in today's list - a user has up to
// TODAY_OUTFIT_LIMIT (server/constants/todayOutfits.js). createToday
// (allControllers.js) builds the set once per day; getToday returns it in
// `rank` order.
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

  // True when the outfit only made today's list thanks to its tights range
  // (services/tightsService.js) - the Today card says "Wear with tights".
  withTights: {
    type: Boolean,
    default: false,
  },

  // Hidden by "too hot" / "too cold" on the Today page
  // (server/services/temperatureFeedbackService.js). Kept rather than
  // deleted, so today's list still counts as built; getToday leaves it out.
  hidden: {
    type: Boolean,
    default: false,
  },

  // 0 = best. Lists built before ranking moved to the server have none.
  rank: {
    type: Number,
    default: null,
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

  // How much the season affects what they wear: 1 (not at all) to 5 (very
  // much) - Today's seasonal points (constants/seasonality.js).
  seasonality: { type: Number, min: 1, max: 5, default: null },

  // Palette ids (shared/colorPalettes.json) the user likes - outfits that
  // fit one score FAVOURITE_PALETTE_BONUS higher on Today
  // (services/todayScoreService.js).
  favouritePalettes: { type: [String], default: [] },

  // Today's photo analyses (services/analysisQuotaService.js): the UTC day
  // ("2026-11-02") and how many were run on it.
  analysisDay: { type: String, default: null },
  analysisCount: { type: Number, default: 0 },

  // The notice for the Today list built at `builtAt`, when few outfits fit
  // the weather (services/todaySelectionService.js): the level ("few" /
  // "shopping") and weather band ("cold" / "mild" / "hot") of the message
  // to show (shared/todayMessages.json). level null = no notice.
  todayNotice: {
    level: { type: String, enum: ["few", "shopping", null], default: null },
    band: { type: String, enum: ["cold", "mild", "hot", null], default: null },
    builtAt: { type: Date, default: null },
  },

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


/* -------------------- FOOTWEAR -------------------- */

// Kept apart from Clothes: footwear is never matched into outfits, so it has
// no role (`type`) - just a subtype from shared/footwearByGender.json. The
// Today page suggests shoes for the worn outfit and marks them worn
// (FootwearScore below).
const footwearSchema = new mongoose.Schema({
name: { type: String, required: true },
imageUrl: { type: String, default: "" },

cloudinaryId: {
    type: String,
    default: ""
  },

// The shown image (above) is the photo with its background removed. A
// small copy for grids, and the photo as uploaded - see
// services/imageService.js, which deletes all three together.
thumbnailUrl: { type: String, default: "" },
thumbnailCloudinaryId: { type: String, default: "" },
originalImageUrl: { type: String, default: "" },
originalCloudinaryId: { type: String, default: "" },

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},

colors: { type: [String], required: true },
styles: { type: [String], required: true },
subtype: { type: String, required: true },

lastWornDate: { type: Date, default: null },
tags: { type: [String], required: false },

timesWorn: { type: Number, default: 0 },
timesWornThisYear: { type: Number, default: 0 },
wornYear: { type: Number, default: null },

analysis: { type: analysisSchema, default: undefined },
});

// The Footwear tab pages through a user's footwear newest first.
footwearSchema.index({ userId: 1, _id: -1 });


/* -------------------- FOOTWEAR SCORE -------------------- */

// A user's personal adjustment for pairing an outfit's bottom (or
// one-piece) subtype with a footwear type, learned on the Today page
// (server/services/footwearScoreService.js). Sparse like MatchScore: a
// document only exists once the user has scrolled past or worn that
// pairing. The score is the baseline (shared/footwearMatrices.json) plus
// this adjustment.
const footwearScoreSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  bottomSubtype: { type: String, required: true },
  footwearSubtype: { type: String, required: true },

  adjustment: { type: Number, default: 0 },

  // Scrolling past counts at most once per pairing per day.
  lastRejectedDate: { type: Date, default: null },

});

footwearScoreSchema.index(
  { userId: 1, bottomSubtype: 1, footwearSubtype: 1 },
  { unique: true }
);


/* -------------------- MODELS -------------------- */

module.exports = {
User: mongoose.model("User", userSchema),
Match: mongoose.model("Match", matchSchema),
Today: mongoose.model("Today", todaySchema),
Clothes: mongoose.model("Clothes", clothesSchema),
Footwear: mongoose.model("Footwear", footwearSchema),
FootwearScore: mongoose.model("FootwearScore", footwearScoreSchema),
Preferences: mongoose.model("Preferences", preferencesSchema),
MatchScore: mongoose.model("MatchScore", matchScoreSchema),
};