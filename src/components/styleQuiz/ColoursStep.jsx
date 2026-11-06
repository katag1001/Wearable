import { coloursQuestion } from "@core/constants/styleQuizOptions.js";
import ColourFamilyPicker from "../preferences/ColourFamilyPicker";

// Style quiz step: favourite colour families, up to 3 (optional). Skip
// moves on without saving any (useStyleQuiz.skipColours).
const ColoursStep = ({ families, selected, onToggle, onBack, onSkip, onNext }) => (
  <div className="style-quiz-step">
    <div className="style-quiz-header">
      <h2 className="page-title">{coloursQuestion.title}</h2>
    </div>

    <button type="button" className="style-quiz-skip-link" onClick={onSkip}>
      Skip
    </button>

    <ColourFamilyPicker families={families} selected={selected} onToggle={onToggle} />

    <div className="style-quiz-actions">
      <button type="button" className="style-quiz-back-button" onClick={onBack}>
        Back
      </button>

      <button
        type="button"
        className="style-quiz-finish-button"
        onClick={onNext}
        disabled={selected.length === 0}
      >
        Next
      </button>
    </div>
  </div>
);

export default ColoursStep;
