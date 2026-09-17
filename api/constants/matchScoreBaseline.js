// api/constants/matchScoreBaseline.js
//
// Baseline compatibility scores between clothing subtypes, per gender and
// style archetype. Every score is currently a 5 - this is a placeholder
// default, not real data. Real values get hand-tuned later per archetype.
//
// A pair is usable when its score is above 0. This baseline is only ever
// read as the fallback default for a user who has not yet built up their
// own personal score for a given pair (see the per-user scoring collection).
//
// Subtype names must match Clothes.subtype exactly. The canonical list per
// gender lives in shared/subtypesByGender.json.
//
// IMPORTANT: src/constants/typeOptions.jsx (frontend) independently hardcodes
// its own copy of these same subtype names, per gender, alongside each
// subtype's category/season/tags/temperature metadata. It does NOT read from
// shared/subtypesByGender.json. If a subtype is added, removed, or renamed in
// EITHER shared/subtypesByGender.json or src/constants/typeOptions.jsx, the
// other MUST be updated to match, or the two will silently drift apart.

const subtypesByGender = require("../../shared/subtypesByGender.json");

const stylesByGender = {
  man: ["all"],
  woman: ["fun", "classic", "fashion"],
  unisex: ["fun", "classic", "fashion"],
};

const DEFAULT_SCORE = 5;

function buildMatrix(subtypes, defaultScore) {

  const matrix = {};

  subtypes.forEach((rowSubtype) => {

    matrix[rowSubtype] = {};

    subtypes.forEach((colSubtype) => {
      matrix[rowSubtype][colSubtype] = defaultScore;
    });

  });

  return matrix;

}

const matchScoreBaseline = {};

Object.keys(subtypesByGender).forEach((gender) => {

  matchScoreBaseline[gender] = {};

  stylesByGender[gender].forEach((style) => {
    matchScoreBaseline[gender][style] =
      buildMatrix(subtypesByGender[gender], DEFAULT_SCORE);
  });

});

module.exports = {
  matchScoreBaseline,
  subtypesByGender,
  stylesByGender,
  DEFAULT_SCORE,
};
