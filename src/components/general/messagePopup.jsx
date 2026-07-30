import React from "react";
import "./popup.css";

const MessagePopup = ({
  isOpen,
  title = "Message",
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Close",
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">

      <div className="popup-modal">

        <button
          className="popup-close"
          onClick={onClose}
        >
          ×
        </button>


        <div className="popup-header">
          <h2 className="popup-title">
            {title}
          </h2>
        </div>


        <div className="popup-body">
          <p>
            {message}
          </p>
        </div>


        <div className="popup-actions">

          <button
            className="popup-button popup-button-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>


          {onConfirm && (
            <button
              className="popup-button popup-button-delete"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}

        </div>

      </div>

    </div>
  );
};


export default MessagePopup;
