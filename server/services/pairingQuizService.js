// server/services/pairingQuizService.js
//
// Turns the style quiz's pairing answers (constants/pairingQuestions.js)
// into the quiz part of the personal pair scores (MatchScore.quizAdjustment).
// Each answered question SETS the quiz part of every pair in it to the
// points its group gives that answer (yes / no; sometimes is 0), replacing
// the earlier answer. What's been learned since (MatchScore.adjustment,
// matchScoreService.js) is kept - retaking the quiz never wipes it.
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

// Pure: the answered pairs whose quiz part would change. `stored` maps
// pairKey -> the quiz part saved now (a pair with none counts as 0).
function changedQuizParts(adjustments, stored) {
  return adjustments.filter(
    ({ subtypeA, subtypeB, adjustment }) =>
      (stored.get(pairKey(subtypeA, subtypeB)) || 0) !== adjustment
  );
}

// The answered pairs whose quiz part would change, without saving
// anything - so a preference change can be planned before it's saved
// (services/preferenceChangeService.js). [{ subtypeA, subtypeB, adjustment }].
async function planPairingAnswers(userId, answers, gender, baselineMatrix) {
  const adjustments = pairingAdjustments(answers, gender, baselineMatrix);

  if (!adjustments.length) {
    return [];
  }

  const docs = await MatchScore.find({
    userId,
    $or: adjustments.map(({ subtypeA, subtypeB }) => ({ subtypeA, subtypeB })),
  }).lean();

  const stored = new Map(
    docs.map((doc) => [pairKey(doc.subtypeA, doc.subtypeB), doc.quizAdjustment || 0])
  );

  return changedQuizParts(adjustments, stored);
}

// Saves the quiz parts planPairingAnswers found changed. The learned part
// is left as it is.
async function saveQuizParts(userId, changed) {
  if (!changed.length) {
    return;
  }

  await MatchScore.bulkWrite(
    changed.map(({ subtypeA, subtypeB, adjustment }) => ({
      updateOne: {
        filter: { userId, subtypeA, subtypeB },
        update: { $set: { quizAdjustment: adjustment }, $setOnInsert: { adjustment: 0 } },
        upsert: true,
      },
    }))
  );
}

// Plans and saves in one go. Returns the pairs that changed.
async function applyPairingAnswers(userId, answers, gender, baselineMatrix) {
  const changed = await planPairingAnswers(userId, answers, gender, baselineMatrix);

  await saveQuizParts(userId, changed);

  return changed;
}

module.exports = {
  pairsForQuestion,
  pairingAdjustments,
  changedQuizParts,
  planPairingAnswers,
  saveQuizParts,
  applyPairingAnswers,
};
