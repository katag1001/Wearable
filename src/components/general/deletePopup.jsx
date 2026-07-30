import React from "react";
import "./popup.css";

const DeletePopup = ({
  isOpen,
  title = "Delete Item",
  message = "Are you sure you want to delete this item?",
  onConfirm,
  onClose,
  loading = false,
}) => {

  if (!isOpen) return null;

  return (
    <div
      className="popup-overlay"
      onClick={onClose}
    >
      <div
        className="popup-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="popup-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="popup-header">
          <h2 className="popup-title">
            {title}
          </h2>
        </div>

        <div className="popup-body">
          <p>{message}</p>
        </div>

        <div className="popup-actions">
          <button
            className="popup-button popup-button-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="popup-button popup-button-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
