// server/constants/matchScoreBaseline.js
//
// Baseline pair scores per gender. The hand-editable data lives in
// server/constants/matrices/<gender>.js (one file per gender) as a
// row/column grid - this file loads each one, checks it, and converts it
// into the { [subtypeA]: { [subtypeB]: score | null } } lookup shape
// matrixService/outfitScoreService expect.
//
// A cell is either a whole-number score from 0 to 100, or null for a pair
// that can never be matched. Every file is checked on server start, and the
// server refuses to start if any of these is broken:
//  - the subtype order matches shared/subtypesByGender.json (tops, bottoms,
//    onepieces, outers);
//  - every row has one cell per subtype, and the grid is symmetric;
//  - the same subtype twice is null;
//  - the fixed role rules hold (constants/compatibilityRules.js): "never"
//    role pairs are null and "always" role pairs have a score;
//  - every score is a whole number from 0 to 100.
//
// Subtype names must match Clothes.subtype exactly. The canonical list per
// gender and role lives in shared/subtypesByGender.json.
//
// IMPORTANT: src/constants/typeOptions.jsx (frontend) independently hardcodes
// its own copy of these same subtype names, per gender, alongside each
// subtype's category/season/tags/temperature metadata. It does NOT read from
// shared/subtypesByGender.json. If a subtype is added, removed, renamed or
// moved to another role in EITHER shared/subtypesByGender.json or
// src/constants/typeOptions.jsx, the other MUST be updated to match, or the
// two will silently drift apart.

const subtypesByGender = require("../../shared/subtypesByGender.json");
const { ROLES } = require("./outfitShapes.js");
const { NEVER, ALWAYS, getRolePairRule } = require("./compatibilityRules.js");
const { MIN_SCORE, MAX_SCORE } = require("./scoring.js");

const GENDERS = ["man", "woman", "unisex"];

const matrixFiles = {
  man: require("./matrices/man.js"),
  woman: require("./matrices/woman.js"),
  unisex: require("./matrices/unisex.js"),
};

// Flattens one gender's { top: [...], bottom: [...], ... } list into the
// canonical matrix order (tops, bottoms, onepieces, outers) plus a
// subtype -> role lookup.
function canonicalOrder(subtypesByRole) {
  const subtypes = [];
  const roleOf = {};

  ROLES.forEach((role) => {
    (subtypesByRole[role] || []).forEach((subtype) => {
      subtypes.push(subtype);
      roleOf[subtype] = role;
    });
  });

  return { subtypes, roleOf };
}

function isValidScore(value) {
  return Number.isInteger(value) && value >= MIN_SCORE && value <= MAX_SCORE;
}

// Checks one cell against the rules above and throws a message pointing at
// the exact pair if it breaks one.
function checkCell(value, subtypeA, subtypeB, roleOf, label) {
  const where = `${label}: ${subtypeA} + ${subtypeB}`;

  if (value !== null && !isValidScore(value)) {
    throw new Error(`${where} must be null or a whole number from ${MIN_SCORE} to ${MAX_SCORE}.`);
  }

  if (subtypeA === subtypeB) {
    if (value !== null) {
      throw new Error(`${where} must be null - a subtype never matches itself.`);
    }
    return;
  }

  const rule = getRolePairRule(roleOf[subtypeA], roleOf[subtypeB]);

  if (rule === NEVER && value !== null) {
    throw new Error(`${where} must be null - ${roleOf[subtypeA]} + ${roleOf[subtypeB]} never match.`);
  }

  if (rule === ALWAYS && value === null) {
    throw new Error(`${where} needs a score - ${roleOf[subtypeA]} + ${roleOf[subtypeB]} always match.`);
  }
}

// Converts one { subtypes, scores } row/column file into the nested lookup
// shape, after checking every rule listed at the top of this file. `label`
// is only used to make an error point at the right file.
function toLookupMatrix(file, subtypesByRole, label) {
  const { subtypes, roleOf } = canonicalOrder(subtypesByRole);

  const sameOrder =
    file.subtypes.length === subtypes.length &&
    file.subtypes.every((subtype, index) => subtype === subtypes[index]);

  if (!sameOrder) {
    throw new Error(
      `${label}'s "subtypes" list does not match shared/subtypesByGender.json's ` +
      `canonical list (tops, bottoms, onepieces, outers). Update one to match the other.`
    );
  }

  if (file.scores.length !== file.subtypes.length) {
    throw new Error(
      `${label} has ${file.scores.length} score rows but ${file.subtypes.length} ` +
      `subtypes - they must match.`
    );
  }

  file.scores.forEach((row, i) => {
    if (row.length !== file.subtypes.length) {
      throw new Error(
        `${label}: row "${file.subtypes[i]}" has ${row.length} scores but there are ` +
        `${file.subtypes.length} subtypes.`
      );
    }
  });

  const matrix = {};

  file.subtypes.forEach((rowSubtype, i) => {
    matrix[rowSubtype] = {};

    file.subtypes.forEach((colSubtype, j) => {
      const value = file.scores[i][j];

      if (value !== file.scores[j][i]) {
        throw new Error(
          `${label}: ${rowSubtype} + ${colSubtype} is ${value} but ` +
          `${colSubtype} + ${rowSubtype} is ${file.scores[j][i]} - the grid must be symmetric.`
        );
      }

      checkCell(value, rowSubtype, colSubtype, roleOf, label);
      matrix[rowSubtype][colSubtype] = value;
    });
  });

  return matrix;
}

const matchScoreBaseline = {};

GENDERS.forEach((gender) => {
  matchScoreBaseline[gender] = toLookupMatrix(
    matrixFiles[gender],
    subtypesByGender[gender],
    `server/constants/matrices/${gender}.js`
  );
});

module.exports = {
  GENDERS,
  matchScoreBaseline,
  subtypesByGender,
  canonicalOrder,
  toLookupMatrix,
};
