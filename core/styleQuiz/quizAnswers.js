// core/styleQuiz/quizAnswers.js
//
// Turns the quiz answers into the preferences saved with PUT /preferences.

import { layeringOptions, smartCasualOption } from "../constants/pairingQuestions.js";
import { resolveStyleQuiz } from "../utils/resolveStyleQuiz.js";
import { asksPairingQuestions } from "./quizSteps.js";

// The quiz's pictures as yes / no answers. Layering, once answered:
// ticked → yes, not ticked → no. Smart and casual: only a pick is sent.
export const buildPairingAnswers = ({ layeredTops, layeringAnswered, likesSmartCasual }) => ({
  ...(layeringAnswered &&
    Object.fromEntries(
      layeringOptions.map(({ key }) => [key, layeredTops.includes(key) ? "yes" : "no"])
    )),
  ...(likesSmartCasual && { [smartCasualOption.key]: "yes" }),
});

export const buildQuizPreferences = ({
  gender,
  selectedImages,
  likesSmartCasual,
  layeredTops,
  layeringAnswered,
  weeklyTags,
  seasonality,
  temperature,
  trends,
}) => {
  const { colour, pattern } = resolveStyleQuiz(selectedImages);

  return {
    gender,
    colour,
    pattern,
    seasonality,
    temperature,
    // Left out when the trends step is skipped.
    ...(trends !== undefined && { trends }),
    // Only sent for genders that were asked the pairing questions.
    ...(asksPairingQuestions(gender) && {
      pairingAnswers: buildPairingAnswers({ layeredTops, layeringAnswered, likesSmartCasual }),
    }),
    // Only the days picked, so retaking the quiz never clears a day
    // already set on the Weekly Preferences page.
    ...Object.fromEntries(
      Object.entries(weeklyTags).filter(([, tagName]) => tagName)
    ),
  };
};
