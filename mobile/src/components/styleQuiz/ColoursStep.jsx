// Style quiz: favourite colour families, up to 3 (optional). Skip moves on
// without saving any (useStyleQuiz.skipColours).

import { ColourFamilyPicker } from "./ColourFamilyPicker";
import { QuizActions } from "./QuizActions";
import { SubtitleWithSkip } from "./SubtitleWithSkip";

export const ColoursStep = ({ quiz }) => (
  <>
    <SubtitleWithSkip onSkip={quiz.skipColours} />

    <ColourFamilyPicker
      families={quiz.colourFamilies}
      selected={quiz.favouriteColourFamilies}
      onToggle={quiz.toggleColourFamily}
    />

    <QuizActions
      onBack={quiz.goBack}
      onNext={quiz.goToNextStep}
      nextDisabled={quiz.favouriteColourFamilies.length === 0}
    />
  </>
);
