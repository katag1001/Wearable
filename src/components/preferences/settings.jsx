import {
  AI_ABOUT_SECTIONS,
  AI_CHOICES,
  AI_SETTINGS_DESCRIPTION,
  AI_SOURCES,
  AI_USAGE_TEXT,
  AI_USAGE_TITLE,
  DAILY_PHOTO_LIMIT,
} from "@core/constants/aiAnalysis.js";
import { useAiSettings } from "@core/hooks/useAiSettings.js";
import { splitBold } from "@core/utils/boldText.js";
import "./stylePreferences.css";
import "./settings.css";
import "../../styles/pages.css";

// Copy with **bold** parts.
const RichText = ({ text }) =>
  splitBold(text).map(({ text: part, bold }, index) =>
    bold ? <strong key={index}>{part}</strong> : <span key={index}>{part}</span>
  );

// The logic lives in useAiSettings (shared with the mobile app); this only
// renders it. A choice is saved as soon as it's picked.
const Settings = () => {
  const {
    aiAnalysis,
    changeAiAnalysis,
    usedToday,
    loading,
    saving,
    error,
    success,
  } = useAiSettings();

  if (loading) {
    return (
      <div className="style-preferences">
        <div className="style-preferences-loading">
          Loading your settings...
        </div>
      </div>
    );
  }

  return (
    <div className="style-preferences">
      {/* HEADER */}

      <div className="style-preferences-header">
        <h2 className="page-title">Settings</h2>
      </div>

      {/* AI PHOTO ANALYSIS */}

      <div className="style-preferences-section">
        <h3 className="style-preferences-section-title">
          AI photo analysis
        </h3>

        <p className="style-preferences-section-description">
          {AI_SETTINGS_DESCRIPTION}
        </p>

        <div className="style-preferences-choice-options">
          {AI_CHOICES.map((option) => (
            <button
              key={option.label}
              type="button"
              className={`style-preferences-choice-card ${
                aiAnalysis === option.value
                  ? "style-preferences-choice-card--selected"
                  : ""
              }`}
              onClick={() => changeAiAnalysis(option.value)}
              disabled={saving}
              aria-pressed={aiAnalysis === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

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

      {/* ABOUT AI */}

      {AI_ABOUT_SECTIONS.map((section) => (
        <div key={section.title} className="style-preferences-section">
          <h3 className="style-preferences-section-title">
            {section.title}
          </h3>

          {section.paragraphs.map((text) => (
            <p key={text} className="style-preferences-section-description">
              <RichText text={text} />
            </p>
          ))}

          {section.points && (
            <ul className="settings-points">
              {section.points.map((text) => (
                <li key={text}>
                  <RichText text={text} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* USAGE */}

      <div className="style-preferences-section">
        <h3 className="style-preferences-section-title">
          {AI_USAGE_TITLE}
        </h3>

        <p className="style-preferences-section-description">
          {AI_USAGE_TEXT} Today: <strong>{usedToday} of {DAILY_PHOTO_LIMIT}</strong>.
        </p>
      </div>

      {/* SOURCES */}

      <div className="style-preferences-section">
        <h3 className="style-preferences-section-title">
          Sources
        </h3>

        <ul className="settings-sources">
          {AI_SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;
