import { useEffect, useState } from "react";
import {
  genderQuestionOptions,
  temperatureQuestionOptions,
  styleImageOptions,
} from "../../constants/styleQuizOptions";
import { resolveStyleQuiz } from "../../utils/resolveStyleQuiz";
import "./stylePreferences.css";
import "../../styles/pages.css";

import { URL } from "../../config";

const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No authentication token found in localStorage.");
  }

  return token;
};

const getResponseData = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Response was not valid JSON:", err);
    return null;
  }
};

const StylePreferences = () => {
  const [gender, setGender] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPreferences = async () => {
      const token = getToken();

      if (!token) {
        setError("You must be logged in to view your preferences.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${URL}/preferences`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          setGender(null);
          setTemperature(null);
          return;
        }

        if (response.status === 401) {
          const result = await getResponseData(response);

          throw new Error(
            result?.message ||
              "Your session has expired. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(
            `Failed to load preferences (${response.status}).`
          );
        }

        const result = await getResponseData(response);

        setGender(result?.data?.gender ?? null);
        setTemperature(result?.data?.temperature ?? null);
      } catch (err) {
        setError(err.message || "Failed to load preferences.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleGenderSelect = (value) => {
    setGender(value);
    setError("");
    setSuccess("");
  };

  const handleTemperatureSelect = (value) => {
    setTemperature(value);
    setError("");
    setSuccess("");
  };

  const toggleImage = (key) => {
    setSelectedImages((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key]
    );

    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    const token = getToken();

    if (!token) {
      setError("You must be logged in to save your preferences.");
      return;
    }

    const body = { gender, temperature };

    if (selectedImages.length > 0) {
      const { style, colour, pattern } = resolveStyleQuiz(selectedImages, gender);

      body.style = style;
      body.colour = colour;
      body.pattern = pattern;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${URL}/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        const result = await getResponseData(response);

        throw new Error(
          result?.message || "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Failed to save preferences (${response.status}).`
        );
      }

      setSelectedImages([]);
      setSuccess("Preferences saved successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

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
          Pick every image that feels like you to update your style,
          colour and pattern preferences.
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
