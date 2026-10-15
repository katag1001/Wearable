import { useNavigate } from "react-router-dom";
import {
  genderQuestionOptions,
  temperatureQuestionOptions,
} from "@core/constants/styleQuizOptions.js";
import { useStyleQuiz } from "@core/hooks/useStyleQuiz.js";
import WeeklyTagStep from "./WeeklyTagStep";
import PairingQuestionStep from "./PairingQuestionStep";
import "./styleQuizForm.css";

// The quiz logic lives in useStyleQuiz (core/hooks/useStyleQuiz.js),
// shared with the mobile app; this only renders it.
const StyleQuizForm = ({ onComplete }) => {
  const navigate = useNavigate();

  const quiz = useStyleQuiz({
    onComplete: () => {
      onComplete?.();
      navigate("/");
    },
  });

  const {
    step,
    goToNextStep,
    goBack,
    saving,
    error,
    gender,
    chooseGender,
    imageOptions,
    selectedImages,
    toggleImage,
    weeklyTags,
    setWeeklyTag,
    finish,
  } = quiz;

  return (
    <div className="style-quiz">
      {step === "gender" && (
        <div className="style-quiz-step">
          <div className="style-quiz-header">
            <h2 className="page-title">How do you usually dress?</h2>
          </div>

          <div className="style-quiz-choice-options">
            {genderQuestionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`style-quiz-choice-card ${
                  gender === option.value ? "style-quiz-choice-card--selected" : ""
                }`}
                onClick={() => chooseGender(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "images" && (
        <div className="style-quiz-step">
          <div className="style-quiz-header">
            <h2 className="page-title">Select all that apply</h2>
            <p className="page-subtitle">Pick every image that feels like you.</p>
          </div>

          <div className="style-quiz-image-grid">
            {imageOptions
              .map((option) => {
                const isSelected = selectedImages.includes(option.key);

                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`style-quiz-image-card ${
                      isSelected ? "style-quiz-image-card--selected" : ""
                    }`}
                    onClick={() => toggleImage(option.key)}
                    aria-pressed={isSelected}
                  >
                    <img
                      src={option.image}
                      alt={option.key}
                      className="style-quiz-image-card-image"
                    />

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
            <button
              type="button"
              className="style-quiz-back-button"
              onClick={goBack}
            >
              Back
            </button>

            <button
              type="button"
              className="style-quiz-finish-button"
              onClick={goToNextStep}
              disabled={selectedImages.length === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === "pairing" && (
        <PairingQuestionStep
          question={quiz.pairingQuestion}
          answer={quiz.pairingAnswer}
          onAnswer={quiz.answerPairing}
          onBack={quiz.backFromPairing}
        />
      )}

      {step === "weekly" && (
        <WeeklyTagStep
          weeklyTags={weeklyTags}
          onTagChange={setWeeklyTag}
          onBack={goBack}
          onNext={goToNextStep}
        />
      )}

      {step === "temperature" && (
        <div className="style-quiz-step">
          <div className="style-quiz-header">
            <h2 className="page-title">
              Do you generally feel too cold or too hot?
            </h2>
          </div>

          <div className="style-quiz-choice-options">
            {temperatureQuestionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="style-quiz-choice-card"
                onClick={() => finish(option.value)}
                disabled={saving}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="style-quiz-actions">
            <button
              type="button"
              className="style-quiz-back-button"
              onClick={goBack}
              disabled={saving}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="style-quiz-message style-quiz-message--error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default StyleQuizForm;
