// server/constants/editableFields.js
//
// The only fields a client may set on each kind of document. Everything
// else in a request body (userId, scores, wear counts, clothesKey...) is
// ignored, so a hand-made request can't move a document to another user,
// point an outfit at someone else's clothes, or change server-kept values.
// Applied with pickFields (services/requestFields.js).

// A clothing item, from the add / edit form and the favourite heart.
const CLOTHING_FIELDS = [
  "name",
  "imageUrl",
  "cloudinaryId",
  "colors",
  "pattern",
  "fabric",
  "type",
  "subtype",
  "tags",
  "favourite",
  "wearWithTights",
  // Set once, from the photo analysis of a new item.
  "analysis",
];

// A pair of footwear, from its add / edit form. (Worn values are changed
// only by the shoe box's wear / unwear routes.)
const FOOTWEAR_FIELDS = [
  "name",
  "imageUrl",
  "cloudinaryId",
  "colors",
  "styles",
  "subtype",
  "tags",
  "analysis",
];

// An outfit, from the card editor, the heart and "worn today".
// (createMatch only takes `clothes`, checked against the user's items.)
// Its seasons aren't here: they come from its items
// (services/seasonalityService.js).
const MATCH_FIELDS = [
  "min_temp",
  "max_temp",
  "tags",
  "favourite",
  "lastWornDate",
  "noTights",
];

// Putting an outfit or clothing item back to how it was before it was
// marked worn today (core/today/wornSnapshot.js).
const WORN_SNAPSHOT_FIELDS = [
  "lastWornDate",
  "timesWorn",
  "timesWornThisYear",
  "wornYear",
];

module.exports = {
  CLOTHING_FIELDS,
  FOOTWEAR_FIELDS,
  MATCH_FIELDS,
  WORN_SNAPSHOT_FIELDS,
};
