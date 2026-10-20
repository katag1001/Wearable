import React, { useState } from "react";

import { getImageUrl } from "@core/utils/getImageUrl.js";
import { useShoeChooser } from "@core/hooks/useShoeChooser.js";

import "../../general/popup.css";
import "./todayFootwear.css";

/*
 * Change shoes: a popup with the outfit's shoes one at a time, best
 * first (next lowers the pairing of the shoe being left). The logic is
 * useShoeChooser, shared with the mobile app; this renders it.
 *
 * `onChoose(shoe)` may return a promise (saving the worn outfit's shoes);
 * the popup closes once it resolves true. `chooseLabel`: the button's
 * text.
 */
const ShoeChooserModal = ({
  footwear,
  outfit,
  startShoe,
  chooseLabel,
  onChoose,
  onClose,
}) => {

  const {
    shoes,
    current,
    index,
    goNext,
    goPrev,
  } = useShoeChooser({ footwear, outfit, startShoe });

  const [saving, setSaving] = useState(false);


  const choose = async () => {
    setSaving(true);
    const done = await onChoose(current);
    setSaving(false);

    if (done !== false) onClose();
  };


  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !saving) {
      onClose();
    }
  };


  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-modal today-shoe-modal">

        <button
          className="popup-close"
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
        >
          ×
        </button>

        <div className="popup-header">
          <h2 className="popup-title">
            Change shoes
          </h2>
        </div>

        {current ? (
          <>
            <div className="featured-outfit-content today-shoe-content">

              <div className="today-image-group">
                {current.imageUrl && (
                  <img
                    src={getImageUrl(current.imageUrl, 800)}
                    alt={current.name}
                    className="today-image"
                  />
                )}
              </div>

              {/* PREVIOUS / NEXT - next lowers the shoe being left */}

              {shoes.length > 1 && (
                <>
                  <button
                    className="today-arrow-button today-arrow-prev"
                    onClick={goPrev}
                    aria-label="Previous shoes"
                  >
                    ‹
                  </button>

                  <button
                    className="today-arrow-button today-arrow-next"
                    onClick={goNext}
                    aria-label="Next shoes"
                  >
                    ›
                  </button>
                </>
              )}

            </div>

            <p className="today-footwear-name">
              {current.name}
            </p>

            <p className="today-footwear-position">
              {index + 1} of {shoes.length}
            </p>
          </>
        ) : (
          <p className="today-footwear-message">
            Loading footwear...
          </p>
        )}

        <div className="popup-actions">

          <button
            className="popup-button popup-button-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="popup-button popup-button-delete"
            onClick={choose}
            disabled={!current || saving}
          >
            {saving ? "Saving..." : chooseLabel}
          </button>

        </div>

      </div>
    </div>
  );
};


export default ShoeChooserModal;
