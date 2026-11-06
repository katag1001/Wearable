// server/services/pairingQuizService.js
//
// Turns the style quiz's pairing answers (constants/pairingQuestions.js)
// into personal score adjustments. Each answered question SETS the
// adjustment of every pair in it to the points its group gives that answer
// (yes / no; sometimes is 0), replacing any earlier answer or learning,
// so retaking the quiz starts those pairs again from the new answer.
// Learning (matchScoreService.js) then carries on from there.
//
// Only scores change - pairs the matrix doesn't allow are skipped, so an
// answer can never make a pair match or stop matching.

const { MatchScore } = require("../models/AllModels.js");
const {
  PAIRING_QUESTION_GENDERS,
  pairingQuestions,
} = require("../constants/pairingQuestions.js");
const { canonicalPairKey, pairKey } = require("./matrixService.js");
const { clampAdjustment } = require("./outfitScoreService.js");

// The points an answer gives a pair group. Undefined for an unknown answer.
function answerPoints(group, answer) {
  return answer === "sometimes" ? 0 : group[answer];
}

// Every [subtypeA, subtypeB] pair a group covers, in canonical order.
function pairsForGroup({ pairs: [subtypesA, subtypesB] }) {
  return subtypesA.flatMap((subtypeA) =>
    subtypesB.map((subtypeB) => canonicalPairKey(subtypeA, subtypeB))
  );
}

// Every pair a question covers.
function pairsForQuestion(question) {
  return question.pairGroups.flatMap(pairsForGroup);
}

// The adjustment to store for every allowed pair in the answered
// questions. Unknown questions or answers, and genders without pairing
// questions, give nothing. If two answered questions share a pair, the
// lower adjustment wins.
function pairingAdjustments(answers, gender, baselineMatrix) {
  const adjustments = new Map();

  if (!answers || !PAIRING_QUESTION_GENDERS.includes(gender)) {
    return [];
  }

  Object.entries(answers).forEach(([questionKey, answer]) => {
    const question = pairingQuestions[questionKey];

    question?.pairGroups.forEach((group) => {
      const value = answerPoints(group, answer);

      if (value === undefined) {
        return;
      }

      pairsForGroup(group).forEach(([subtypeA, subtypeB]) => {
        const baseline = baselineMatrix?.[subtypeA]?.[subtypeB];

        if (typeof baseline !== "number") {
          return;
        }

        const key = pairKey(subtypeA, subtypeB);
        const adjustment = clampAdjustment(baseline, value);
        const existing = adjustments.get(key);

        if (!existing || adjustment < existing.adjustment) {
          adjustments.set(key, { subtypeA, subtypeB, adjustment });
        }
      });
    });
  });

  return [...adjustments.values()];
}

async function applyPairingAnswers(userId, answers, gender, baselineMatrix) {
  const adjustments = pairingAdjustments(answers, gender, baselineMatrix);

  if (!adjustments.length) {
    return;
  }

  await MatchScore.bulkWrite(
    adjustments.map(({ subtypeA, subtypeB, adjustment }) => ({
      updateOne: {
        filter: { userId, subtypeA, subtypeB },
        update: { $set: { adjustment } },
        upsert: true,
      },
    }))
  );
}

module.exports = {
  pairsForQuestion,
  pairingAdjustments,
  applyPairingAnswers,
};
