import {
  genderQuestionOptions,
  temperatureQuestionOptions,
  styleImageOptions,
} from "@core/constants/styleQuizOptions.js";
import { useStylePreferences } from "@core/hooks/useStylePreferences.js";
import PairingPreferences from "./PairingPreferences";
import "./stylePreferences.css";
import "../../styles/pages.css";

// The logic lives in useStylePreferences (shared with the mobile app);
// this only renders it.
const StylePreferences = () => {
  const {
    gender,
    chooseGender: handleGenderSelect,
    temperature,
    chooseTemperature: handleTemperatureSelect,
    selectedImages,
    toggleImage,
    pairingAnswers,
    answerPairing: handlePairingAnswer,
    showPairingQuestions,
    save: handleSave,
    loading,
    saving,
    error,
    success,
  } = useStylePreferences();

  if (loading) {
    return (
      <div className="style-preferences">
        <div className="style-preferences-loading">
          Loading your preferences...
        </div>
      </div>
    );
  }

  return (
    <div className="style-preferences">
      {/* HEADER */}

      <div className="style-preferences-header">
        <h2 className="page-title">Style Preferences</h2>

        <p className="page-subtitle">
          Update how you dress and the styles you like.
        </p>
      </div>

      {/* GENDER */}

      <div className="style-preferences-section">
        <h3 className="style-preferences-section-title">
          How do you usually dress?
        </h3>

        <div className="style-preferences-choice-options">
          {genderQuestionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`style-preferences-choice-card ${
                gender === option.value
                  ? "style-preferences-choice-card--selected"
                  : ""
              }`}
              onClick={() => handleGenderSelect(option.value)}
              aria-pressed={gender === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* TEMPERATURE */}

      <div className="style-preferences-section">
        <h3 className="style-preferences-section-title">
          Do you generally feel too cold or too hot?
        </h3>

        <div className="style-preferences-choice-options">
          {temperatureQuestionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`style-preferences-choice-card ${
                temperature === option.value
                  ? "style-preferences-choice-card--selected"
                  : ""
              }`}
              onClick={() => handleTemperatureSelect(option.value)}
              aria-pressed={temperature === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* STYLE IMAGES */}

      <div className="style-preferences-section">
        <h3 className="style-preferences-section-title">
          Select all that apply
        </h3>

        <p className="style-preferences-section-description">
          Pick every image that feels like you to update your colour and
          pattern preferences.
        </p>

        <div className="style-preferences-image-grid">
          {styleImageOptions.map((option) => {
            const isSelected = selectedImages.includes(option.key);

            return (
              <button
                key={option.key}
                type="button"
                className={`style-preferences-image-card ${
                  isSelected ? "style-preferences-image-card--selected" : ""
                }`}
                onClick={() => toggleImage(option.key)}
                aria-pressed={isSelected}
              >
                <img
                  src={option.image}
                  alt={option.key}
                  className="style-preferences-image-card-image"
                />

                {isSelected && (
                  <span
                    className="style-preferences-image-card-check"
                    aria-label="Selected"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PAIRING QUESTIONS (woman / unisex only) */}

      {showPairingQuestions && (
        <PairingPreferences
          answers={pairingAnswers}
          onAnswer={handlePairingAnswer}
        />
      )}

      {/* SAVE */}

      <button
        type="button"
        className="style-preferences-save-button"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>

      {/* ERROR */}

      {error && (
        <div
          className="style-preferences-message style-preferences-message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div
          className="style-preferences-message style-preferences-message--success"
          role="status"
        >
          {success}
        </div>
      )}
    </div>
  );
};

export default StylePreferences;
