// server/constants/footwearScoreBaseline.js
//
// Baseline scores (0-90) for pairing an outfit's bottom or one-piece with a
// footwear type, per gender. The hand-editable data is
// shared/footwearMatrices.json, shaped
//   { [gender]: { [bottom or onepiece subtype]: { [footwear type]: score } } }
// It lives in shared/ because the Today page ranks shoes in the browser
// (src/components/today/footwear/footwearRanking.js); the server only uses
// it to keep learned adjustments within 0-100.
//
// There are no nulls - every shoe is always shown, a poor pairing just
// scores low. Two neutral scores live in shared/footwearScoring.json:
//  - notInMatrixScore: a pairing missing from the user's matrix (e.g. a
//    shoe added under a different gender preference);
//  - noBottomScore: every shoe, for an outfit with no bottom or one-piece.
//
// Every gender is checked when the server starts, and the server refuses
// to start if any of these is broken:
//  - the rows are exactly that gender's bottoms then one-pieces from
//    shared/subtypesByGender.json, in order;
//  - every row has exactly that gender's footwear types from
//    shared/footwearByGender.json, in order;
//  - unisex footwear is every woman and man type;
//  - every score is a whole number from 0 to 90 (MAX_BASELINE_SCORE).

const subtypesByGender = require("../../shared/subtypesByGender.json");
const footwearByGender = require("../../shared/footwearByGender.json");
const footwearMatrices = require("../../shared/footwearMatrices.json");
const footwearScoring = require("../../shared/footwearScoring.json");
const { MIN_SCORE, MAX_BASELINE_SCORE } = require("./scoring.js");

const GENDERS = ["man", "woman", "unisex"];
const DEFAULT_GENDER = "unisex";

const { notInMatrixScore: NOT_IN_MATRIX_SCORE, noBottomScore: NO_BOTTOM_SCORE } =
  footwearScoring;

const sameList = (a, b) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

// Returns every problem found (an empty list when the data is valid).
function findFootwearMatrixProblems({
  matrices = footwearMatrices,
  subtypes = subtypesByGender,
  footwear = footwearByGender,
} = {}) {
  const problems = [];

  const union = [...new Set([...(footwear.woman || []), ...(footwear.man || [])])];

  if (!sameList([...(footwear.unisex || [])].sort(), [...union].sort())) {
    problems.push("unisex footwear must be every woman and man footwear type");
  }

  [NOT_IN_MATRIX_SCORE, NO_BOTTOM_SCORE].forEach((score) => {
    if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_BASELINE_SCORE) {
      problems.push(`neutral score ${score} must be a whole number from ${MIN_SCORE} to ${MAX_BASELINE_SCORE}`);
    }
  });

  GENDERS.forEach((gender) => {
    const matrix = matrices[gender];

    if (!matrix) {
      problems.push(`${gender}: missing matrix`);
      return;
    }

    const expectedRows = [
      ...(subtypes[gender]?.bottom || []),
      ...(subtypes[gender]?.onepiece || []),
    ];
    const expectedColumns = footwear[gender] || [];

    if (!sameList(Object.keys(matrix), expectedRows)) {
      problems.push(`${gender}: rows must be the bottoms then one-pieces from shared/subtypesByGender.json, in order`);
    }

    Object.entries(matrix).forEach(([row, cells]) => {
      if (!sameList(Object.keys(cells), expectedColumns)) {
        problems.push(`${gender} / ${row}: columns must be the footwear types from shared/footwearByGender.json, in order`);
      }

      Object.entries(cells).forEach(([column, score]) => {
        if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_BASELINE_SCORE) {
          problems.push(`${gender} / ${row} / ${column}: ${score} must be a whole number from ${MIN_SCORE} to ${MAX_BASELINE_SCORE}`);
        }
      });
    });
  });

  return problems;
}

const problems = findFootwearMatrixProblems();

if (problems.length) {
  throw new Error(
    `shared/footwearMatrices.json is invalid:\n - ${problems.join("\n - ")}`
  );
}

// The baseline for one pairing. With no bottom or one-piece every shoe gets
// NO_BOTTOM_SCORE; a pairing missing from the matrix gets NOT_IN_MATRIX_SCORE.
function getFootwearBaseline(gender, bottomSubtype, footwearSubtype) {
  if (!bottomSubtype) return NO_BOTTOM_SCORE;

  const matrix = footwearMatrices[gender] || footwearMatrices[DEFAULT_GENDER];
  const score = matrix[bottomSubtype]?.[footwearSubtype];

  return Number.isInteger(score) ? score : NOT_IN_MATRIX_SCORE;
}

module.exports = {
  NOT_IN_MATRIX_SCORE,
  NO_BOTTOM_SCORE,
  findFootwearMatrixProblems,
  getFootwearBaseline,
};
