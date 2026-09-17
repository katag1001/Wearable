import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  genderQuestionOptions,
  styleImageOptions,
} from "../../constants/styleQuizOptions";
import { resolveStyleQuiz } from "../../utils/resolveStyleQuiz";
import { URL } from "../../config";
import "./styleQuizForm.css";

const StyleQuizForm = ({ onComplete }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleGenderSelect = (value) => {
    setGender(value);
    setError("");
    setStep(2);
  };

  const toggleImage = (key) => {
    setSelectedImages((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key]
    );

    setError("");
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleFinish = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to save your preferences.");
      return;
    }

    const { style, colour, pattern } = resolveStyleQuiz(selectedImages);

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${URL}/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gender, style, colour, pattern }),
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
      {step === 1 && (
        <div className="style-quiz-step">
          <div className="style-quiz-header">
            <h2 className="page-title">How do you usually dress?</h2>
          </div>

          <div className="style-quiz-gender-options">
            {genderQuestionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`style-quiz-gender-card ${
                  gender === option.value ? "style-quiz-gender-card--selected" : ""
                }`}
                onClick={() => handleGenderSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="style-quiz-step">
          <div className="style-quiz-header">
            <h2 className="page-title">Select all that apply</h2>
            <p className="page-subtitle">Pick every image that feels like you.</p>
          </div>

          <div className="style-quiz-image-grid">
            {styleImageOptions.map((option) => {
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
              disabled={saving}
            >
              Back
            </button>

            <button
              type="button"
              className="style-quiz-finish-button"
              onClick={handleFinish}
              disabled={saving || selectedImages.length === 0}
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
