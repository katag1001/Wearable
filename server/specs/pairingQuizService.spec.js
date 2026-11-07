const test = require("node:test");
const assert = require("node:assert/strict");

const {
  pairsForQuestion,
  pairingAdjustments,
  changedQuizParts,
} = require("../services/pairingQuizService.js");
const { pairKey } = require("../services/matrixService.js");
const {
  PAIRING_QUESTION_GENDERS,
  pairingQuestions,
} = require("../constants/pairingQuestions.js");
const { clampAdjustment } = require("../services/outfitScoreService.js");
const { matchScoreBaseline } = require("../constants/matchScoreBaseline.js");

const woman = matchScoreBaseline.woman;

function findAdjustment(adjustments, subtypeA, subtypeB) {
  return adjustments.find(
    (entry) =>
      (entry.subtypeA === subtypeA && entry.subtypeB === subtypeB) ||
      (entry.subtypeA === subtypeB && entry.subtypeB === subtypeA)
  );
}

// The pair's score once the answer is applied.
function scoreAfter(adjustments, subtypeA, subtypeB) {
  return woman[subtypeA][subtypeB] + findAdjustment(adjustments, subtypeA, subtypeB).adjustment;
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

test("every pair group gives points for yes and no", () => {
  Object.entries(pairingQuestions).forEach(([key, question]) => {
    question.pairGroups.forEach((group) => {
      assert.equal(typeof group.yes, "number", `${key}: yes`);
      assert.equal(typeof group.no, "number", `${key}: no`);
    });
  });
});

test("yes adds the group's points to every allowed pair", () => {
  const adjustments = pairingAdjustments({ turtlenecksUnderShirts: "yes" }, "woman", woman);
  const allowed = pairsForQuestion(pairingQuestions.turtlenecksUnderShirts).filter(
    ([subtypeA, subtypeB]) => typeof woman[subtypeA]?.[subtypeB] === "number"
  );

  assert.ok(allowed.length > 0);
  assert.equal(adjustments.length, allowed.length);
  allowed.forEach(([subtypeA, subtypeB]) => {
    assert.equal(
      findAdjustment(adjustments, subtypeA, subtypeB).adjustment,
      clampAdjustment(woman[subtypeA][subtypeB], 10)
    );
  });
});

test("groups in one question can move their pairs by different amounts", () => {
  const yes = pairingAdjustments({ shirtsOverTops: "yes" }, "woman", woman);
  const no = pairingAdjustments({ shirtsOverTops: "no" }, "woman", woman);

  assert.equal(findAdjustment(yes, "Buttondown shirt", "Vest").adjustment, 10);
  assert.equal(findAdjustment(yes, "Buttondown shirt", "Short t-shirt").adjustment, 5);
  assert.equal(findAdjustment(no, "Buttondown shirt", "Vest").adjustment, -10);
  assert.equal(findAdjustment(no, "Buttondown shirt", "Short t-shirt").adjustment, -5);
});

test("sometimes keeps every pair at its baseline", () => {
  const adjustments = pairingAdjustments({ shirtsOverTops: "sometimes" }, "woman", woman);

  assert.ok(adjustments.length > 0);
  adjustments.forEach((entry) => assert.equal(entry.adjustment, 0));
});

test("an OFF answer takes the pair score down to 0", () => {
  const adjustments = pairingAdjustments({ smartAndCasual: "no" }, "woman", woman);

  assert.equal(scoreAfter(adjustments, "Hoodie/sweatshirt", "Tailored blazer"), 0);
});

test("t-shirt over a long-sleeve top: ticked is 70, unticked turns it off", () => {
  const yes = pairingAdjustments({ tshirtsOverLongSleeves: "yes" }, "woman", woman);
  const no = pairingAdjustments({ tshirtsOverLongSleeves: "no" }, "woman", woman);

  assert.equal(scoreAfter(yes, "Short t-shirt", "Long-sleeve t-shirt"), 70);
  assert.equal(scoreAfter(no, "Short t-shirt", "Long-sleeve t-shirt"), 40);
});

test("pairs the matrix doesn't allow are skipped", () => {
  // Denim shirt + Croptop is null in the woman matrix.
  const adjustments = pairingAdjustments({ shirtsOverTops: "yes" }, "woman", woman);

  assert.equal(findAdjustment(adjustments, "Denim shirt", "Croptop"), undefined);
  assert.ok(findAdjustment(adjustments, "Denim shirt", "Vest"));
});

test("an adjustment is limited so the pair score stays within 0-100", () => {
  const matrix = {
    "Short turtleneck": { "Buttondown shirt": 95 },
    "Buttondown shirt": { "Short turtleneck": 95 },
  };

  const [entry] = pairingAdjustments({ turtlenecksUnderShirts: "yes" }, "woman", matrix);

  assert.equal(entry.adjustment, 5);
});

test("men, unknown questions and unknown answers give nothing", () => {
  assert.deepEqual(pairingAdjustments({ turtlenecksUnderShirts: "no" }, "man", woman), []);
  assert.deepEqual(pairingAdjustments({ notAQuestion: "no" }, "woman", woman), []);
  assert.deepEqual(pairingAdjustments({ turtlenecksUnderShirts: "maybe" }, "woman", woman), []);
  assert.deepEqual(pairingAdjustments(undefined, "woman", woman), []);
});

/* -------------------- changedQuizParts -------------------- */

test("only pairs whose quiz part would change count as changed", () => {
  const adjustments = pairingAdjustments({ linenWithSummerDresses: "yes" }, "woman", woman);
  const [first, ...rest] = adjustments;

  // The first pair already has this answer saved; the rest have another.
  const stored = new Map([
    [pairKey(first.subtypeA, first.subtypeB), first.adjustment],
    ...rest.map(({ subtypeA, subtypeB }) => [pairKey(subtypeA, subtypeB), -10]),
  ]);

  assert.deepEqual(changedQuizParts(adjustments, stored), rest);
});

test("a pair with no quiz part saved counts as 0", () => {
  const adjustments = [
    { subtypeA: "A", subtypeB: "B", adjustment: 0 },
    { subtypeA: "A", subtypeB: "C", adjustment: 10 },
  ];

  assert.deepEqual(changedQuizParts(adjustments, new Map()), [adjustments[1]]);
});

test("answering exactly as before changes nothing", () => {
  const adjustments = pairingAdjustments({ shirtsOverTops: "no" }, "woman", woman);
  const stored = new Map(
    adjustments.map(({ subtypeA, subtypeB, adjustment }) => [pairKey(subtypeA, subtypeB), adjustment])
  );

  assert.deepEqual(changedQuizParts(adjustments, stored), []);
});
