const test = require("node:test");
const assert = require("node:assert/strict");

const {
  matchScoreBaseline,
  subtypesByGender,
  stylesByGender,
  toLookupMatrix,
} = require("../constants/matchScoreBaseline.js");

test("all 7 archetypes load with the right dimensions", () => {
  Object.keys(stylesByGender).forEach((gender) => {
    const expectedSize = subtypesByGender[gender].length;

    stylesByGender[gender].forEach((style) => {
      const matrix = matchScoreBaseline[gender][style];
      const rowSubtypes = Object.keys(matrix);

      assert.equal(rowSubtypes.length, expectedSize);
      assert.equal(Object.keys(matrix[rowSubtypes[0]]).length, expectedSize);
    });
  });
});

test("every loaded cell is a finite number", () => {
  Object.keys(stylesByGender).forEach((gender) => {
    stylesByGender[gender].forEach((style) => {
      const matrix = matchScoreBaseline[gender][style];

      Object.keys(matrix).forEach((rowSubtype) => {
        Object.values(matrix[rowSubtype]).forEach((score) => {
          assert.equal(typeof score, "number");
          assert.equal(Number.isFinite(score), true);
        });
      });
    });
  });
});

test("every matrix is symmetric and every same-subtype pair is -20", () => {
  Object.keys(stylesByGender).forEach((gender) => {
    stylesByGender[gender].forEach((style) => {
      const matrix = matchScoreBaseline[gender][style];

      Object.keys(matrix).forEach((a) => {
        assert.equal(matrix[a][a], -20, `${gender}-${style}: ${a} with itself`);

        Object.keys(matrix[a]).forEach((b) => {
          assert.equal(matrix[a][b], matrix[b][a], `${gender}-${style}: ${a} / ${b}`);
        });
      });
    });
  });
});

test("a known hand-tuned self-pair score loads correctly (Hoodie/sweatshirt needs layering for man)", () => {
  assert.equal(matchScoreBaseline.man.all["Hoodie/sweatshirt"]["Hoodie/sweatshirt"], -20);
});

test("toLookupMatrix converts a row/column file into the nested lookup shape", () => {
  const file = {
    subtypes: ["A", "B"],
    scores: [
      [5, 3],
      [3, 5],
    ],
  };

  const matrix = toLookupMatrix(file, ["A", "B"], "test-file");

  assert.deepEqual(matrix, { A: { A: 5, B: 3 }, B: { A: 3, B: 5 } });
});

test("toLookupMatrix throws when the file's subtype order doesn't match the canonical list", () => {
  const file = {
    subtypes: ["B", "A"],
    scores: [
      [5, 3],
      [3, 5],
    ],
  };

  assert.throws(() => toLookupMatrix(file, ["A", "B"], "test-file"));
});

test("toLookupMatrix throws when a row has the wrong number of scores", () => {
  const file = {
    subtypes: ["A", "B"],
    scores: [
      [5, 3],
      [3],
    ],
  };

  assert.throws(() => toLookupMatrix(file, ["A", "B"], "test-file"));
});
