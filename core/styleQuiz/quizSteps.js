// core/styleQuiz/quizSteps.js

import { pairingQuestionGenders } from "../constants/pairingQuestions.js";

// The quiz's steps in order. The pairing questions are only asked for the
// genders in pairingQuestionGenders. "colours" is the favourite colour
// families. A retake (Style Preferences) leaves out "weekly" - the days
// are only changed on Weekly Preferences.
export const getQuizSteps = (gender, { retake = false } = {}) => {
  const steps = pairingQuestionGenders.includes(gender)
    ? ["gender", "temperature", "images", "colours", "pairing", "weekly", "seasonality", "trends"]
    : ["gender", "temperature", "images", "colours", "weekly", "seasonality", "trends"];

  return retake ? steps.filter((step) => step !== "weekly") : steps;
};

export const asksPairingQuestions = (gender) =>
  pairingQuestionGenders.includes(gender);
