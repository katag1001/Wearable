const test = require("node:test");
const assert = require("node:assert/strict");

const {
  GENDERS,
  matchScoreBaseline,
  subtypesByGender,
  canonicalOrder,
  toLookupMatrix,
} = require("../constants/matchScoreBaseline.js");
const { REQUIRES_LAYERING, REQUIRES_TOP } = require("../constants/requiresLayering.js");

test("one matrix per gender loads with the right dimensions", () => {
  GENDERS.forEach((gender) => {
    const { subtypes } = canonicalOrder(subtypesByGender[gender]);
    const matrix = matchScoreBaseline[gender];

    assert.equal(Object.keys(matrix).length, subtypes.length);
    assert.equal(Object.keys(matrix[subtypes[0]]).length, subtypes.length);
  });
});

test("every loaded cell is null or a whole number from 0 to 100", () => {
  GENDERS.forEach((gender) => {
    Object.values(matchScoreBaseline[gender]).forEach((row) => {
      Object.values(row).forEach((value) => {
        assert.equal(value === null || (Number.isInteger(value) && value >= 0 && value <= 100), true);
      });
    });
  });
});

test("every subtype on a layering list has at least one compatible partner it can be layered with", () => {
  GENDERS.forEach((gender) => {
    const { roleOf } = canonicalOrder(subtypesByGender[gender]);
    const matrix = matchScoreBaseline[gender];

    REQUIRES_LAYERING[gender].forEach((subtype) => {
      const partners = Object.entries(matrix[subtype])
        .filter(([other, value]) => value !== null && roleOf[other] === roleOf[subtype]);
      assert.notEqual(partners.length, 0, `${gender}: ${subtype} has no layering partner`);
    });

    REQUIRES_TOP[gender].forEach((subtype) => {
      const tops = Object.entries(matrix[subtype])
        .filter(([other, value]) => value !== null && roleOf[other] === "top");
      assert.notEqual(tops.length, 0, `${gender}: ${subtype} has no compatible top`);
    });
  });
});

const smallList = { top: ["T1", "T2"], bottom: ["B1", "B2"], onepiece: [], outer: [] };

function smallFile(overrides = {}) {
  // order: T1, T2, B1, B2
  const scores = [
    [null, 50, 80, 70],
    [50, null, 60, 90],
    [80, 60, null, null],
    [70, 90, null, null],
  ];

  Object.entries(overrides).forEach(([cell, value]) => {
    const [i, j] = cell.split(",").map(Number);
    scores[i][j] = value;
    scores[j][i] = value;
  });

  return { subtypes: ["T1", "T2", "B1", "B2"], scores };
}

test("toLookupMatrix converts a valid file into the nested lookup shape", () => {
  const matrix = toLookupMatrix(smallFile(), smallList, "test-file");

  assert.equal(matrix.T1.B1, 80);
  assert.equal(matrix.B1.T1, 80);
  assert.equal(matrix.B1.B2, null);
});

test("toLookupMatrix throws when the subtype order doesn't match the canonical list", () => {
  const file = smallFile();
  file.subtypes = ["T2", "T1", "B1", "B2"];

  assert.throws(() => toLookupMatrix(file, smallList, "test-file"), /canonical list/);
});

test("toLookupMatrix throws when a row has the wrong number of cells", () => {
  const file = smallFile();
  file.scores[1] = [50, null, 60];

  assert.throws(() => toLookupMatrix(file, smallList, "test-file"), /row "T2"/);
});

test("toLookupMatrix throws when the grid isn't symmetric", () => {
  const file = smallFile();
  file.scores[0][2] = 81;

  assert.throws(() => toLookupMatrix(file, smallList, "test-file"), /symmetric/);
});

test("toLookupMatrix throws when a subtype paired with itself has a score", () => {
  assert.throws(() => toLookupMatrix(smallFile({ "0,0": 50 }), smallList, "test-file"), /never matches itself/);
});

test("toLookupMatrix throws when a never-role pair (two bottoms) has a score", () => {
  assert.throws(() => toLookupMatrix(smallFile({ "2,3": 50 }), smallList, "test-file"), /never match/);
});

test("toLookupMatrix throws when an always-role pair (top + bottom) is null", () => {
  assert.throws(() => toLookupMatrix(smallFile({ "0,2": null }), smallList, "test-file"), /always match/);
});

test("toLookupMatrix throws for a score outside 0-100 or not a whole number", () => {
  assert.throws(() => toLookupMatrix(smallFile({ "0,2": 101 }), smallList, "test-file"), /whole number/);
  assert.throws(() => toLookupMatrix(smallFile({ "0,2": 50.5 }), smallList, "test-file"), /whole number/);
});

test("a decided pair (top + top) may be null or a score", () => {
  assert.doesNotThrow(() => toLookupMatrix(smallFile({ "0,1": null }), smallList, "test-file"));
  assert.doesNotThrow(() => toLookupMatrix(smallFile({ "0,1": 0 }), smallList, "test-file"));
});
