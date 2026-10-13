import {
  pairingQuestions,
  pairingAnswerOptions,
} from "../../constants/pairingQuestions";

// The style quiz's pairing questions on the Style Preferences page, grouped
// under their section headings, without pictures. Answers aren't stored, so
// every question starts unanswered and only the ones answered are saved.
// Clicking the selected answer again clears it.
const PairingPreferences = ({ answers, onAnswer }) => {
  const sections = [...new Set(pairingQuestions.map((question) => question.section))];

  return sections.map((section) => (
    <div key={section} className="style-preferences-section">
      <h3 className="style-preferences-section-title">{section}</h3>

      <p className="style-preferences-section-description">
        Leave a question unanswered to keep how those pairings score now.
      </p>

      {pairingQuestions
        .filter((question) => question.section === section)
        .map(({ key, question }) => (
          <div key={key} className="style-preferences-pairing-question">
            <p className="style-preferences-pairing-question-text">{question}</p>

            <div className="style-preferences-choice-options">
              {pairingAnswerOptions.map((option) => {
                const isSelected = answers[key] === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`style-preferences-choice-card ${
                      isSelected ? "style-preferences-choice-card--selected" : ""
                    }`}
                    onClick={() => onAnswer(key, isSelected ? null : option.value)}
                    aria-pressed={isSelected}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  ));
};

export default PairingPreferences;
