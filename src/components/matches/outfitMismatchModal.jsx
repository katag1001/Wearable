import React, { useState } from "react";
import { createPortal } from "react-dom";

import { useOutfitMismatch } from "@core/hooks/useOutfitMismatch.js";
import MismatchPicker from "../general/mismatchPicker.jsx";

import "../general/popup.css";
import "./outfitMismatchModal.css";

/*
 * The broken heart on an outfit's expanded card: straight to picking the
 * two items that don't go together. `onMismatched(deletedMatchIds)` runs
 * once saved; Back or × just closes. Logic: useOutfitMismatch (shared with
 * the mobile outfit screen).
 *
 * Rendered on document.body so it sits above the expanded card, with
 * clicks kept from reaching the card underneath.
 */
const OutfitMismatchModal = ({ match, onClose, onMismatched }) => {
  const [error, setError] = useState(null);
  const mismatch = useOutfitMismatch({ match, onMismatched, onError: setError });

  const close = () => {
    if (!mismatch.saving) onClose();
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) close();
  };

  return createPortal(
    <div className="popup-overlay outfit-mismatch-overlay" onClick={handleOverlayClick}>
      <div className="popup-modal">

        <button
          type="button"
          className="popup-close"
          onClick={close}
          disabled={mismatch.saving}
          aria-label="Close"
        >
          ×
        </button>

        <div className="popup-header">
          <h2 className="popup-title">Mismatch</h2>
        </div>

        {error && <p className="outfit-mismatch-error">{error}</p>}

        <MismatchPicker
          clothes={mismatch.clothes}
          isSelected={mismatch.isSelected}
          onToggle={mismatch.toggleItem}
          canConfirm={mismatch.canConfirm}
          saving={mismatch.saving}
          onBack={close}
          onConfirm={mismatch.confirm}
        />

      </div>
    </div>,
    document.body
  );
};

export default OutfitMismatchModal;
