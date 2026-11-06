// core/styleQuiz/quizSteps.js

import { pairingQuestionGenders } from "../constants/pairingQuestions.js";

// The quiz's steps in order. The pairing questions are only asked for the
// genders in pairingQuestionGenders. "colours" is the favourite colour
// families.
export const getQuizSteps = (gender) =>
  pairingQuestionGenders.includes(gender)
    ? ["gender", "temperature", "images", "colours", "pairing", "weekly", "seasonality", "trends"]
    : ["gender", "temperature", "images", "colours", "weekly", "seasonality", "trends"];

export const asksPairingQuestions = (gender) =>
  pairingQuestionGenders.includes(gender);
