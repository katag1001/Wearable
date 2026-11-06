import { useNavigate } from "react-router-dom";
import {
  genderQuestionOptions,
  seasonalityQuestion,
  temperatureQuestion,
} from "@core/constants/styleQuizOptions.js";
import { useStyleQuiz } from "@core/hooks/useStyleQuiz.js";
import WeeklyTagStep from "./WeeklyTagStep";
import LayeringStep from "./LayeringStep";
import PointScale from "../preferences/PointScale";
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
            <h2 className="page-title">How do you prefer to dress?</h2>
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

          <div className="style-quiz-actions style-quiz-actions--centred">
            <button
              type="button"
              className="style-quiz-finish-button"
              onClick={goToNextStep}
              disabled={!gender}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === "temperature" && (
        <div className="style-quiz-step">
          <div className="style-quiz-header">
            <h2 className="page-title">{temperatureQuestion.title}</h2>
          </div>

          <PointScale
            question={temperatureQuestion}
            value={quiz.temperature}
            onChange={quiz.setTemperature}
          />

          <div className="style-quiz-actions">
            <button type="button" className="style-quiz-back-button" onClick={goBack}>
              Back
            </button>

            <button type="button" className="style-quiz-finish-button" onClick={goToNextStep}>
              Next
            </button>
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

            {quiz.showSmartCasual && (
              <button
                type="button"
                className={`style-quiz-image-card ${
                  quiz.likesSmartCasual ? "style-quiz-image-card--selected" : ""
                }`}
                onClick={quiz.toggleSmartCasual}
                aria-pressed={quiz.likesSmartCasual}
                aria-label={quiz.smartCasualOption.label}
              >
                {quiz.smartCasualOption.image ? (
                  <img
                    src={quiz.smartCasualOption.image}
                    alt=""
                    className="style-quiz-image-card-image"
                  />
                ) : (
                  <span className="style-quiz-pairing-placeholder">
                    {quiz.smartCasualOption.label}
                  </span>
                )}

                {quiz.likesSmartCasual && (
                  <span className="style-quiz-image-card-check" aria-label="Selected">
                    ✓
                  </span>
                )}
              </button>
            )}
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
        <LayeringStep
          options={quiz.layeringOptions}
          ticked={quiz.layeredTops}
          onToggle={quiz.toggleLayering}
          onBack={goBack}
          onSkip={quiz.skipLayering}
          onNext={quiz.finishLayering}
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

      {step === "seasonality" && (
        <div className="style-quiz-step">
          <div className="style-quiz-header">
            <h2 className="page-title">
              {seasonalityQuestion.title}
            </h2>
          </div>

          <PointScale
            question={seasonalityQuestion}
            value={quiz.seasonality}
            onChange={quiz.setSeasonality}
          />

          <div className="style-quiz-actions">
            <button
              type="button"
              className="style-quiz-back-button"
              onClick={goBack}
              disabled={saving}
            >
              Back
            </button>

            <button
              type="button"
              className="style-quiz-finish-button"
              onClick={finish}
              disabled={saving}
            >
              {saving ? "Saving..." : "Finish"}
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
