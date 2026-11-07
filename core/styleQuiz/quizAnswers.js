// core/styleQuiz/quizAnswers.js
//
// Turns the quiz answers into the preferences saved with PUT /preferences.

import { layeringOptions, smartCasualOption } from "../constants/pairingQuestions.js";
import { resolveStyleQuiz } from "../utils/resolveStyleQuiz.js";
import { asksPairingQuestions } from "./quizSteps.js";

// The quiz's pictures as yes / no answers. Layering, once answered:
// ticked → yes, not ticked → no. Smart and casual: only a pick is sent -
// except on a retake (`smartCasualAnswered`: the style pictures were
// answered, not skipped), where leaving it unpicked sends no, so it can
// be turned off again.
export const buildPairingAnswers = ({
  layeredTops,
  layeringAnswered,
  likesSmartCasual,
  smartCasualAnswered = false,
}) => ({
  ...(layeringAnswered &&
    Object.fromEntries(
      layeringOptions.map(({ key }) => [key, layeredTops.includes(key) ? "yes" : "no"])
    )),
  ...(likesSmartCasual && { [smartCasualOption.key]: "yes" }),
  ...(!likesSmartCasual && smartCasualAnswered && { [smartCasualOption.key]: "no" }),
});

// `retake`: Style Preferences' retake of the quiz. Skipping the style
// pictures there (none picked) keeps the saved colour and pattern levels
// and smart-and-casual answer, instead of sending nothing for them.
export const buildQuizPreferences = ({
  gender,
  selectedImages,
  favouriteColourFamilies,
  likesSmartCasual,
  layeredTops,
  layeringAnswered,
  weeklyTags,
  seasonality,
  temperature,
  trends,
  retake = false,
}) => {
  const imagesAnswered = selectedImages.length > 0;
  const { colour, pattern } = resolveStyleQuiz(selectedImages);

  return {
    gender,
    ...((!retake || imagesAnswered) && { colour, pattern }),
    favouriteColourFamilies,
    seasonality,
    temperature,
    // Left out when the trends step is skipped.
    ...(trends !== undefined && { trends }),
    // Only sent for genders that were asked the pairing questions.
    ...(asksPairingQuestions(gender) && {
      pairingAnswers: buildPairingAnswers({
        layeredTops,
        layeringAnswered,
        likesSmartCasual: (!retake || imagesAnswered) && likesSmartCasual,
        smartCasualAnswered: retake && imagesAnswered,
      }),
    }),
    // Only the days picked, so retaking the quiz never clears a day
    // already set on the Weekly Preferences page.
    ...Object.fromEntries(
      Object.entries(weeklyTags).filter(([, tagName]) => tagName)
    ),
  };
};
