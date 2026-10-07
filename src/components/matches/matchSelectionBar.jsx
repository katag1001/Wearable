import React from "react";

import "./matchSelection.css";

/*
 * Shown while one or more outfits are ticked: the count,
 * a way to untick them all, and the bin to delete them.
 */
const MatchSelectionBar = ({
  count,
  onClear,
  onDelete,
  disabled = false,
}) => {
  if (count === 0) return null;

  return (
    <div className="match-selection-bar">
      <span className="match-selection-count">
        {count} selected
      </span>

      <button
        type="button"
        className="match-selection-clear"
        onClick={onClear}
        disabled={disabled}
      >
        Clear
      </button>

      <button
        type="button"
        className="match-selection-bin"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${count} selected outfits`}
        title="Delete selected"
      >
        <svg
          viewBox="0 0 24 24"
          className="match-selection-bin-icon"
          aria-hidden="true"
        >
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="M6 7l1 13h10l1-13" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>
    </div>
  );
};

export default MatchSelectionBar;
