import React from "react";

import { useOutfitFeedback } from "@core/hooks/useOutfitFeedback.js";
import { TOO_COLD, TOO_HOT } from "@core/today/outfitFeedback.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import "../general/popup.css";
import "./outfitFeedback.css";

/*
 * The broken heart: a popup for the outfit on screen. "Too hot" / "too
 * cold" move its range a degree and hide it for today; "Mismatch" goes on
 * to picking the two items that don't go together. Each moves on to the
 * next outfit once saved. The logic is useOutfitFeedback, shared with the
 * mobile app; this renders it.
 */
const OutfitFeedbackModal = ({ today, onClose }) => {

  const feedback = useOutfitFeedback({ today, onClose });
  const picking = feedback.step === "mismatch";
  const saving = Boolean(feedback.saving);


  const close = () => {
    if (!saving) onClose();
  };


  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };


  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-modal">

        <button
          className="popup-close"
          onClick={close}
          disabled={saving}
          aria-label="Close"
        >
          ×
        </button>

        <div className="popup-header">
          <h2 className="popup-title">
            {picking ? "Mismatch" : "Not this outfit?"}
          </h2>
        </div>

        {picking ? (
          <>
            <div className="popup-body">
              <p>Choose the 2 items that don't go together.</p>
            </div>

            <div className="outfit-feedback-items">
              {feedback.clothes.map((item) => {
                const selected = feedback.isSelected(item._id);

                return (
                  <button
                    key={item._id}
                    type="button"
                    className={`outfit-feedback-item ${selected ? "selected" : ""}`}
                    onClick={() => feedback.toggleItem(item._id)}
                    aria-pressed={selected}
                    aria-label={item.name}
                  >
                    {item.imageUrl ? (
                      <img src={getImageUrl(item.imageUrl, 400)} alt="" />
                    ) : (
                      <span>{item.name}</span>
                    )}

                    {selected && (
                      <span className="outfit-feedback-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="popup-actions">
              <button
                className="popup-button popup-button-cancel"
                onClick={feedback.backToChoices}
                disabled={saving}
              >
                Back
              </button>

              <button
                className="popup-button popup-button-delete"
                onClick={feedback.confirmMismatch}
                disabled={!feedback.canConfirmMismatch || saving}
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="outfit-feedback-options">
              <button
                className="popup-button popup-button-cancel outfit-feedback-option"
                onClick={feedback.tooHot}
                disabled={saving}
              >
                {feedback.saving === TOO_HOT ? "Saving..." : "Outfit too hot for today"}
              </button>

              <button
                className="popup-button popup-button-cancel outfit-feedback-option"
                onClick={feedback.tooCold}
                disabled={saving}
              >
                {feedback.saving === TOO_COLD ? "Saving..." : "Outfit too cold for today"}
              </button>

              <button
                className="popup-button popup-button-cancel outfit-feedback-option"
                onClick={feedback.startMismatch}
                disabled={saving}
              >
                Mismatch
              </button>
            </div>

            <div className="popup-actions">
              <button
                className="popup-button popup-button-cancel"
                onClick={close}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};


export default OutfitFeedbackModal;
