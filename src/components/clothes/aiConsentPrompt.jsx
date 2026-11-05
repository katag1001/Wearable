import React from "react";

import {
  AI_CHOICES,
  AI_CONSENT_MESSAGE,
  AI_CONSENT_SAVED_MESSAGE,
} from "@core/constants/aiAnalysis.js";

/*
 * The AI consent prompt before adding an item (logic: useAiConsent, shared
 * with the mobile app). There's no way past it without answering - only
 * the add modal's own close. Once answered, "Preference saved!" until OK,
 * with "Read more" (`onReadMore`) opening Settings' about-AI text.
 */
const AiConsentPrompt = ({ consent, onReadMore }) => {

  if (consent.showSaved) {
    return (
      <div className="photo-analysis">
        <p className="photo-analysis-text">{AI_CONSENT_SAVED_MESSAGE}</p>

        <button type="button" className="modal-button" onClick={consent.acknowledge}>
          OK
        </button>

        <button type="button" className="text-button" onClick={onReadMore}>
          Read more
        </button>
      </div>
    );
  }

  return (
    <div className="photo-analysis">
      <p className="photo-analysis-text">{AI_CONSENT_MESSAGE}</p>

      <div className="modal-button-row">
        {AI_CHOICES.map(({ value, label }) => (
          <button
            key={label}
            type="button"
            className="modal-button"
            disabled={consent.saving}
            onClick={() => consent.answer(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {consent.error && (
        <p className="validation-message">{consent.error}</p>
      )}
    </div>
  );
};

export default AiConsentPrompt;
