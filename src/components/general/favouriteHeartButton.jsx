import React from "react";

import "./favouriteHeartButton.css";

// The heart in the top corner of an outfit or clothing card. The click
// doesn't reach the card (which would open the editor).
const FavouriteHeartButton = ({ favourite, onToggle }) => (
  <button
    type="button"
    className={
      favourite
        ? "favourite-heart-button favourited"
        : "favourite-heart-button"
    }
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    aria-pressed={!!favourite}
    aria-label={favourite ? "Remove from favourites" : "Add to favourites"}
  >
    <svg
      className="favourite-heart-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 21s-6.716-4.35-9.428-8.03C.86 10.42 1.02 7.28 3.34 5.34c2.02-1.7 4.86-1.4 6.66.66L12 8.06l2-2.06c1.8-2.06 4.64-2.36 6.66-.66 2.32 1.94 2.48 5.08.77 7.63C18.716 16.65 12 21 12 21z" />
    </svg>
  </button>
);

export default FavouriteHeartButton;
