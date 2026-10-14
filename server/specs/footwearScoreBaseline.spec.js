const test = require("node:test");
const assert = require("node:assert/strict");

const {
  NOT_IN_MATRIX_SCORE,
  NO_BOTTOM_SCORE,
  findFootwearMatrixProblems,
  getFootwearBaseline,
} = require("../constants/footwearScoreBaseline.js");

const footwearMatrices = require("../../shared/footwearMatrices.json");

test("shared/footwearMatrices.json passes every check", () => {
  assert.deepEqual(findFootwearMatrixProblems(), []);
});

test("getFootwearBaseline reads the gender's matrix", () => {
  assert.equal(
    getFootwearBaseline("woman", "Mini skirt", "Ballerinas"),
    footwearMatrices.woman["Mini skirt"].Ballerinas
  );
  assert.equal(
    getFootwearBaseline("man", "Tailored trousers", "Formal shoes"),
    footwearMatrices.man["Tailored trousers"]["Formal shoes"]
  );
});

test("getFootwearBaseline falls back to unisex for an unknown gender", () => {
  assert.equal(
    getFootwearBaseline("other", "Chinos", "Loafers"),
    footwearMatrices.unisex.Chinos.Loafers
  );
});

test("getFootwearBaseline gives the neutral scores", () => {
  // A woman's shoe that isn't in the man matrix.
  assert.equal(getFootwearBaseline("man", "Jeans", "Heels"), NOT_IN_MATRIX_SCORE);
  assert.equal(getFootwearBaseline("woman", null, "Heels"), NO_BOTTOM_SCORE);
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
