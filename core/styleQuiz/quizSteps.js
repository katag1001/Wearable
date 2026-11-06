// core/styleQuiz/quizSteps.js

import { pairingQuestionGenders } from "../constants/pairingQuestions.js";

// The quiz's steps in order. The pairing questions are only asked for the
// genders in pairingQuestionGenders.
export const getQuizSteps = (gender) =>
  pairingQuestionGenders.includes(gender)
    ? ["gender", "temperature", "images", "pairing", "weekly", "seasonality"]
    : ["gender", "temperature", "images", "weekly", "seasonality"];

export const asksPairingQuestions = (gender) =>
  pairingQuestionGenders.includes(gender);
