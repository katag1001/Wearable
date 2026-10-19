// core/styleQuiz/quizAnswers.js
//
// Turns the quiz answers into the preferences saved with PUT /preferences.

import { resolveStyleQuiz } from "../utils/resolveStyleQuiz.js";
import { asksPairingQuestions } from "./quizSteps.js";

export const buildQuizPreferences = ({
  gender,
  selectedImages,
  favouritePalettes,
  pairingAnswers,
  weeklyTags,
  temperature,
}) => {
  const { colour, pattern } = resolveStyleQuiz(selectedImages);

  return {
    gender,
    colour,
    pattern,
    temperature,
    favouritePalettes,
    // Only sent for genders that were asked the pairing questions.
    ...(asksPairingQuestions(gender) && { pairingAnswers }),
    // Only the days picked, so retaking the quiz never clears a day
    // already set on the Weekly Preferences page.
    ...Object.fromEntries(
      Object.entries(weeklyTags).filter(([, tagName]) => tagName)
    ),
  };
};
