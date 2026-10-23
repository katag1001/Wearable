import React from "react";

import { RATING_STARS } from "@core/matches/rating.js";
import "./starRating.css";

// An outfit's 1-5 star rating: filled stars up to `rating`, outlines after
// (all outlines when null). Clicking a star picks that rating.
const StarRating = ({ rating, onChange, className = "" }) => (
  <div
    className={`star-rating ${className}`.trim()}
    role="radiogroup"
    aria-label="Rating"
  >
    {RATING_STARS.map((star) => {
      const filled = rating != null && star <= rating;

      return (
        <button
          key={star}
          type="button"
          className={filled ? "star-rating-star filled" : "star-rating-star"}
          onClick={(e) => {
            e.stopPropagation();
            onChange(star);
          }}
          role="radio"
          aria-checked={rating === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <svg
            className="star-rating-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2.8l2.83 5.73 6.32.92-4.57 4.46 1.08 6.29L12 17.23l-5.66 2.97 1.08-6.29-4.57-4.46 6.32-.92z" />
          </svg>
        </button>
      );
    })}
  </div>
);

export default StarRating;
