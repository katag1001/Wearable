const test = require("node:test");
const assert = require("node:assert/strict");

const {
  pairsForQuestion,
  pairingAdjustments,
} = require("../services/pairingQuizService.js");
const {
  PAIRING_QUESTION_GENDERS,
  pairingQuestions,
} = require("../constants/pairingQuestions.js");
const { PAIRING_ANSWER_ADJUSTMENTS } = require("../constants/scoring.js");
const { matchScoreBaseline } = require("../constants/matchScoreBaseline.js");

const woman = matchScoreBaseline.woman;

function findAdjustment(adjustments, subtypeA, subtypeB) {
  return adjustments.find(
    (entry) =>
      (entry.subtypeA === subtypeA && entry.subtypeB === subtypeB) ||
      (entry.subtypeA === subtypeB && entry.subtypeB === subtypeA)
  );
}

test("every subtype in the pairing questions exists for every pairing gender", () => {
  PAIRING_QUESTION_GENDERS.forEach((gender) => {
    Object.entries(pairingQuestions).forEach(([key, question]) => {
      pairsForQuestion(question).flat().forEach((subtype) => {
        assert.ok(
          matchScoreBaseline[gender][subtype],
          `${key}: "${subtype}" isn't a ${gender} subtype`
        );
      });
    });
  });
});

test("an answer sets every allowed pair in the question to the answer's value", () => {
  const adjustments = pairingAdjustments({ croptopsLowRise: "sometimes" }, "woman", woman);

  assert.equal(adjustments.length, 2);
  assert.equal(
    findAdjustment(adjustments, "Croptop", "Low waist jeans").adjustment,
    PAIRING_ANSWER_ADJUSTMENTS.sometimes
  );
});

test("a No takes the pair score down to 0", () => {
  const adjustments = pairingAdjustments({ croptopsLowRise: "no" }, "woman", woman);
  const entry = findAdjustment(adjustments, "Croptop", "Low waist jeans");

  assert.equal(woman.Croptop["Low waist jeans"] + entry.adjustment, 0);
});

test("pairs the matrix doesn't allow are skipped", () => {
  // Buttondown shirt + Long t-shirt is null in the woman matrix.
  const adjustments = pairingAdjustments({ shirtsOverTops: "yes" }, "woman", woman);

  assert.equal(findAdjustment(adjustments, "Buttondown shirt", "Long t-shirt"), undefined);
  assert.ok(findAdjustment(adjustments, "Buttondown shirt", "Vest"));
});

test("an adjustment is limited so the pair score stays within 0-100", () => {
  const matrix = { Croptop: { "Low waist jeans": 95 }, "Low waist jeans": { Croptop: 95 } };

  const [entry] = pairingAdjustments({ croptopsLowRise: "yes" }, "woman", matrix);

  assert.equal(entry.adjustment, 5);
});

test("men, unknown questions and unknown answers give nothing", () => {
  assert.deepEqual(pairingAdjustments({ croptopsLowRise: "no" }, "man", woman), []);
  assert.deepEqual(pairingAdjustments({ notAQuestion: "no" }, "woman", woman), []);
  assert.deepEqual(pairingAdjustments({ croptopsLowRise: "maybe" }, "woman", woman), []);
  assert.deepEqual(pairingAdjustments(undefined, "woman", woman), []);
});
