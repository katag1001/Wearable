// api/constants/matchScoreBaseline.js
//
// Baseline compatibility scores between clothing subtypes, per gender and
// style archetype. The actual, hand-editable data lives in
// api/constants/matrices/<gender>-<style>.js (7 files, one per archetype) as
// a row/column grid - this file loads each one, checks its subtype order
// matches the canonical list, and converts it into the
// { [subtypeA]: { [subtypeB]: score } } lookup shape matrixService expects.
//
// A pair is usable when its score is above 0. This baseline is only ever
// read as the fallback default for a user who has not yet built up their
// own personal score for a given pair (see matchScoreService.js).
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

const matrixFiles = {
  man: { all: require("./matrices/man-all.js") },
  woman: {
    fun: require("./matrices/woman-fun.js"),
    classic: require("./matrices/woman-classic.js"),
    fashion: require("./matrices/woman-fashion.js"),
  },
  unisex: {
    fun: require("./matrices/unisex-fun.js"),
    classic: require("./matrices/unisex-classic.js"),
    fashion: require("./matrices/unisex-fashion.js"),
  },
};

// Converts one { subtypes, scores } row/column file into the
// { [subtypeA]: { [subtypeB]: score } } lookup shape, after checking its
// subtype order exactly matches the canonical list for that gender - this
// is what catches a matrix file and shared/subtypesByGender.json ever
// silently drifting apart. `label` is only used to make a mismatch error
// point at the right file.
function toLookupMatrix(file, canonicalSubtypes, label) {
  const sameOrder =
    file.subtypes.length === canonicalSubtypes.length &&
    file.subtypes.every((subtype, index) => subtype === canonicalSubtypes[index]);

  if (!sameOrder) {
    throw new Error(
      `${label}'s "subtypes" list does not match shared/subtypesByGender.json's ` +
      `canonical list. Update one to match the other.`
    );
  }

  if (file.scores.length !== file.subtypes.length) {
    throw new Error(
      `${label} has ${file.scores.length} score rows but ${file.subtypes.length} ` +
      `subtypes - they must match.`
    );
  }

  const matrix = {};

  file.subtypes.forEach((rowSubtype, i) => {
    const row = file.scores[i];

    if (row.length !== file.subtypes.length) {
      throw new Error(
        `${label}: row "${rowSubtype}" has ${row.length} scores but there are ` +
        `${file.subtypes.length} subtypes.`
      );
    }

    matrix[rowSubtype] = {};

    file.subtypes.forEach((colSubtype, j) => {
      matrix[rowSubtype][colSubtype] = row[j];
    });
  });

  return matrix;
}

const matchScoreBaseline = {};

Object.keys(stylesByGender).forEach((gender) => {
  matchScoreBaseline[gender] = {};

  stylesByGender[gender].forEach((style) => {
    matchScoreBaseline[gender][style] = toLookupMatrix(
      matrixFiles[gender][style],
      subtypesByGender[gender],
      `api/constants/matrices/${gender}-${style}.js`
    );
  });
});

module.exports = {
  matchScoreBaseline,
  subtypesByGender,
  stylesByGender,
  toLookupMatrix,
};
