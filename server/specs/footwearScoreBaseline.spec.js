const test = require("node:test");
const assert = require("node:assert/strict");

const {
  NOT_IN_MATRIX_SCORE,
  NO_BOTTOM_SCORE,
  findFootwearMatrixProblems,
} = require("../constants/footwearScoreBaseline.js");

test("shared/footwearMatrices.json passes every check", () => {
  assert.deepEqual(findFootwearMatrixProblems(), []);
});

test("the neutral scores", () => {
  assert.equal(NOT_IN_MATRIX_SCORE, 45);
  assert.equal(NO_BOTTOM_SCORE, 50);
});

test("findFootwearMatrixProblems catches wrong rows, columns, scores and unisex", () => {
  const subtypes = {
    woman: { bottom: ["Jeans"], onepiece: ["Dress"] },
    man: { bottom: ["Jeans"], onepiece: [] },
    unisex: { bottom: ["Jeans"], onepiece: ["Dress"] },
  };
  const footwear = {
    woman: ["Heels"],
    man: ["Boots"],
    unisex: ["Heels"],
  };
  const matrices = {
    woman: { Jeans: { Heels: 50 } },
    man: { Jeans: { Boots: 91 } },
    unisex: { Jeans: { Heels: 50 }, Dress: { Heels: 1.5 } },
  };

  const problems = findFootwearMatrixProblems({ matrices, subtypes, footwear });

  assert.ok(problems.some((p) => p.startsWith("unisex footwear")));
  assert.ok(problems.some((p) => p.startsWith("woman: rows")));
  assert.ok(problems.some((p) => p.includes("man / Jeans / Boots: 91")));
  assert.ok(problems.some((p) => p.includes("unisex / Dress / Heels: 1.5")));
});
