import React from "react";

import { getImageUrl } from "@core/utils/getImageUrl.js";

import "../today/outfitFeedback.css";

/*
 * Picking the two items of an outfit that don't go together, inside a
 * popup: the hint, the item tiles, then Back and Confirm. Used by the
 * Today broken heart (outfitFeedbackModal.jsx) and the outfit card's
 * (outfitMismatchModal.jsx); the logic is useMismatchPicker.
 */
const MismatchPicker = ({
  clothes,
  isSelected,
  onToggle,
  canConfirm,
  saving,
  onBack,
  onConfirm,
}) => (
  <>
    <div className="popup-body">
      <p>Choose the 2 items that don't go together.</p>
    </div>

    <div className="outfit-feedback-items">
      {clothes.map((item) => {
        const selected = isSelected(item._id);

        return (
          <button
            key={item._id}
            type="button"
            className={`outfit-feedback-item ${selected ? "selected" : ""}`}
            onClick={() => onToggle(item._id)}
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
        type="button"
        className="popup-button popup-button-cancel"
        onClick={onBack}
        disabled={saving}
      >
        Back
      </button>

      <button
        type="button"
        className="popup-button popup-button-delete"
        onClick={onConfirm}
        disabled={!canConfirm || saving}
      >
        {saving ? "Saving..." : "Confirm"}
      </button>
    </div>
  </>
);

export default MismatchPicker;
