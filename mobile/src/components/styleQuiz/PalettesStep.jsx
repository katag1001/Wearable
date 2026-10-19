// Style quiz: pick favourite colour palettes (optional).

import { PalettePicker } from "./PalettePicker";
import { QuizActions } from "./QuizActions";

export const PalettesStep = ({ quiz }) => (
  <>
    <PalettePicker
      palettes={quiz.paletteOptions}
      selected={quiz.favouritePalettes}
      onToggle={quiz.togglePalette}
    />

    <QuizActions onBack={quiz.goBack} onNext={quiz.goToNextStep} />
  </>
);
