// server/constants/seasonality.js
//
// Seasons come from what an outfit is made of and its colours, not from a
// setting on each item (services/seasonalityService.js):
//  - each fabric (shared/fabrics.json) and each colour palette
//    (shared/colorPalettes.json "seasons") belongs to some seasons, or none
//    (worn any time);
//  - on Today, outfits in today's season gain points by how much the user
//    dresses by season (Preferences.seasonality, 1-5) - never their saved
//    score;
//  - an outfit's four season flags (the Outfits page season buttons and
//    filter) also use the season temperature bands and the season-named
//    types below.

const SEASONS = ["spring", "summer", "autumn", "winter"];

// Preferences.seasonality (1 = not at all ... 5 = very much) -> the points
// an in-season fabric, and an in-season palette, each add on Today. An
// out-of-season fabric takes the same off.
const SEASONALITY_POINTS = { 1: 0, 2: 2, 3: 4, 4: 6, 5: 8 };

// Users who haven't answered the question yet.
const DEFAULT_SEASONALITY = 3;

// For the season flags only: an outfit fits a season's weather if its
// temperature range (min_temp-max_temp) overlaps the band. null = open.
const SEASON_TEMPERATURE_BANDS = {
  winter: { min: null, max: 12 },
  spring: { min: 8, max: 20 },
  autumn: { min: 8, max: 20 },
  summer: { min: 18, max: null },
};

// For the season flags only: types whose name ties them to seasons, as if
// they were a seasonal fabric. Not used for Today's points.
const SEASON_NAMED_SUBTYPES = {
  "Winter dress": ["autumn", "winter"],
  "Winter mini skirt": ["autumn", "winter"],
  "Strappy summer dress": ["spring", "summer"],
  "Summer dress": ["spring", "summer"],
};

module.exports = {
  SEASONS,
  SEASONALITY_POINTS,
  DEFAULT_SEASONALITY,
  SEASON_TEMPERATURE_BANDS,
  SEASON_NAMED_SUBTYPES,
};
