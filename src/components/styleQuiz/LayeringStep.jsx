import { layeringQuestion } from "@core/constants/pairingQuestions.js";

// Style quiz step: "Do you like to layer tops?" - tick any that apply, or
// skip (useStyleQuiz.finishLayering / skipLayering).
const LayeringStep = ({ options, ticked, onToggle, onBack, onSkip, onNext }) => (
  <div className="style-quiz-step">
    <div className="style-quiz-header">
      <h2 className="page-title">{layeringQuestion.title}</h2>
      <p className="page-subtitle">{layeringQuestion.subtitle}</p>
    </div>

    <button type="button" className="style-quiz-skip-link" onClick={onSkip}>
      Skip
    </button>

    <div className="style-quiz-pairing-images">
      {options.map((option) => {
        const isSelected = ticked.includes(option.key);

        return (
          <button
            key={option.key}
            type="button"
            className={`style-quiz-image-card style-quiz-pairing-card ${
              isSelected ? "style-quiz-image-card--selected" : ""
            }`}
            onClick={() => onToggle(option.key)}
            aria-pressed={isSelected}
            aria-label={option.label}
          >
            {option.image ? (
              <img src={option.image} alt="" className="style-quiz-image-card-image" />
            ) : (
              <span className="style-quiz-pairing-placeholder">Image coming soon</span>
            )}

            {isSelected && (
              <span className="style-quiz-image-card-check" aria-label="Selected">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>

    <div className="style-quiz-actions">
      <button type="button" className="style-quiz-back-button" onClick={onBack}>
        Back
      </button>

      <button type="button" className="style-quiz-finish-button" onClick={onNext}>
        Next
      </button>
    </div>
  </div>
);

export default LayeringStep;
