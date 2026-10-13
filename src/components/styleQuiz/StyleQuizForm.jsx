import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  genderQuestionOptions,
  temperatureQuestionOptions,
  styleImageOptions,
} from "../../constants/styleQuizOptions";
import { pairingQuestionGenders } from "../../constants/pairingQuestions";
import { resolveStyleQuiz } from "../../utils/resolveStyleQuiz";
import { emptyWeeklyTags } from "../../constants/weekDays";
import WeeklyTagStep from "./WeeklyTagStep";
import PairingQuestionStep from "./PairingQuestionStep";
import { URL } from "../../config";
import "./styleQuizForm.css";

// The quiz's steps in order. The pairing questions are only asked for the
// genders in pairingQuestionGenders.
const getSteps = (gender) =>
  pairingQuestionGenders.includes(gender)
    ? ["gender", "images", "pairing", "weekly", "temperature"]
    : ["gender", "images", "weekly", "temperature"];

const StyleQuizForm = ({ onComplete }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState("gender");
  const [gender, setGender] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [pairingAnswers, setPairingAnswers] = useState({});
  const [pairingIndex, setPairingIndex] = useState(0);
  const [weeklyTags, setWeeklyTags] = useState(emptyWeeklyTags);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const goToNextStep = () => {
    const steps = getSteps(gender);
    setStep(steps[steps.indexOf(step) + 1]);
    setError("");
  };

  const handleBack = () => {
    const steps = getSteps(gender);
    setStep(steps[steps.indexOf(step) - 1]);
    setError("");
  };

  const handleGenderSelect = (value) => {
    setGender(value);
    setError("");
    setStep("images");
  };

  const toggleImage = (key) => {
    setSelectedImages((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key]
    );

    setError("");
  };

  const handlePairingAnswer = (questionKey, answer) => {
    setPairingAnswers((current) => ({ ...current, [questionKey]: answer }));
  };

  const handleWeeklyTagChange = (dayKey, tagName) => {
    setWeeklyTags((current) => ({ ...current, [dayKey]: tagName }));
  };

  const handleTemperatureSelect = (value) => {
    handleFinish(value);
  };

  const handleFinish = async (temperature) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to save your preferences.");
      return;
    }

    const { colour, pattern } = resolveStyleQuiz(selectedImages);

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${URL}/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gender,
          colour,
          pattern,
          temperature,
          // Only sent for genders that were asked the pairing questions.
          ...(pairingQuestionGenders.includes(gender) && { pairingAnswers }),
          // Only the days picked, so retaking the quiz never clears a day
          // already set on the Weekly Preferences page.
          ...Object.fromEntries(
            Object.entries(weeklyTags).filter(([, tagName]) => tagName)
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save your answers. Please try again.");
      }

      onComplete?.();
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to save your answers.");
    } finally {
      setSaving(false);
    }
  };

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
                onClick={() => handleGenderSelect(option.value)}
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
            {styleImageOptions
              .filter((option) => option.gender.includes(gender))
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
              onClick={handleBack}
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
          answers={pairingAnswers}
          questionIndex={pairingIndex}
          onQuestionChange={setPairingIndex}
          onAnswer={handlePairingAnswer}
          onBack={handleBack}
          onNext={goToNextStep}
        />
      )}

      {step === "weekly" && (
        <WeeklyTagStep
          weeklyTags={weeklyTags}
          onTagChange={handleWeeklyTagChange}
          onBack={handleBack}
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
                onClick={() => handleTemperatureSelect(option.value)}
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
              onClick={handleBack}
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
