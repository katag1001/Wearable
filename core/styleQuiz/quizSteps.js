// core/styleQuiz/quizSteps.js

import { pairingQuestionGenders } from "../constants/pairingQuestions.js";

// The quiz's steps in order. The pairing questions are only asked for the
// genders in pairingQuestionGenders.
export const getQuizSteps = (gender) =>
  pairingQuestionGenders.includes(gender)
    ? ["gender", "images", "pairing", "weekly", "temperature"]
    : ["gender", "images", "weekly", "temperature"];

export const asksPairingQuestions = (gender) =>
  pairingQuestionGenders.includes(gender);
