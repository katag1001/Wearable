import React from "react";

import { useOutfitFeedback } from "@core/hooks/useOutfitFeedback.js";
import {
  NO_TIGHTS_ITEM,
  NO_TIGHTS_OUTFIT,
  NOT_FOR_TAG,
  TOO_COLD,
  TOO_HOT,
} from "@core/today/outfitFeedback.js";
import MismatchPicker from "../general/mismatchPicker.jsx";

import "../general/popup.css";
import "./outfitFeedback.css";

/*
 * The broken heart: a popup for the outfit on screen. "Too hot" / "too
 * cold" move its range a degree and hide it for today; "Mismatch" goes on
 * to picking the two items that don't go together; "Can't wear this with
 * tights" (only for an outfit there thanks to tights) goes on to choosing
 * this outfit or its skirt, dress or shorts; "Not appropriate for [tag]"
 * (only for an outfit with today's tag) takes the tag off it. Each moves on to the
 * next outfit once saved. The logic is useOutfitFeedback, shared with the
 * mobile app; this renders it.
 */
const OutfitFeedbackModal = ({ today, onClose }) => {

  const feedback = useOutfitFeedback({ today, onClose });
  const picking = feedback.step === "mismatch";
  const choosingTights = feedback.step === "tights";

  const TITLES = {
    choose: "Not this outfit?",
    mismatch: "Mismatch",
    tights: "Not with tights",
  };
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
            {TITLES[feedback.step]}
          </h2>
        </div>

        {picking ? (
          <MismatchPicker
            clothes={feedback.clothes}
            isSelected={feedback.isSelected}
            onToggle={feedback.toggleItem}
            canConfirm={feedback.canConfirmMismatch}
            saving={saving}
            onBack={feedback.backToChoices}
            onConfirm={feedback.confirmMismatch}
          />
        ) : choosingTights ? (
          <>
            <div className="outfit-feedback-options">
              <button
                className="popup-button popup-button-cancel outfit-feedback-option"
                onClick={feedback.noTightsForOutfit}
                disabled={saving}
              >
                {feedback.saving === NO_TIGHTS_OUTFIT ? "Saving..." : "Just this outfit"}
              </button>

              {feedback.tightsItem && (
                <button
                  className="popup-button popup-button-cancel outfit-feedback-option"
                  onClick={feedback.noTightsForItem}
                  disabled={saving}
                >
                  {feedback.saving === NO_TIGHTS_ITEM
                    ? "Saving..."
                    : `Never with this ${feedback.tightsItem.name}`}
                </button>
              )}
            </div>

            <div className="popup-actions">
              <button
                className="popup-button popup-button-cancel"
                onClick={feedback.backToChoices}
                disabled={saving}
              >
                Back
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="outfit-feedback-options">
              <button
                className="popup-button popup-button-cancel outfit-feedback-option"
                onClick={feedback.startMismatch}
                disabled={saving}
              >
                Mismatch
              </button>

              {feedback.offersTights && (
                <button
                  className="popup-button popup-button-cancel outfit-feedback-option"
                  onClick={feedback.startTights}
                  disabled={saving}
                >
                  Can't wear this with tights
                </button>
              )}

              {feedback.offersTag && (
                <button
                  className="popup-button popup-button-cancel outfit-feedback-option"
                  onClick={feedback.notForTag}
                  disabled={saving}
                >
                  {feedback.saving === NOT_FOR_TAG
                    ? "Saving..."
                    : `Not appropriate for ${feedback.todayTag}`}
                </button>
              )}

              {/* tooHot moves the range up (warmer days), so today was too cold for it */}
              <button
                className="popup-button popup-button-cancel outfit-feedback-option"
                onClick={feedback.tooHot}
                disabled={saving}
              >
                {feedback.saving === TOO_HOT ? "Saving..." : "Today's weather too cold for this"}
              </button>

              <button
                className="popup-button popup-button-cancel outfit-feedback-option"
                onClick={feedback.tooCold}
                disabled={saving}
              >
                {feedback.saving === TOO_COLD ? "Saving..." : "Today's weather too hot for this"}
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
