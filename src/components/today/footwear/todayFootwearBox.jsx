import React from "react";

import { getImageUrl } from "@core/utils/getImageUrl.js";
import { useTodayFootwear } from "@core/hooks/useTodayFootwear.js";

import "./todayFootwear.css";

/*
 * The shoe box beside the outfit worn today. The logic (ranking, moving
 * past, wearing, undoing) is useTodayFootwear, shared with the mobile app;
 * this renders it.
 */
const TodayFootwearBox = ({ outfit, todayTag }) => {

  const {
    loading,
    error,
    shoes,
    current,
    index,
    goNext,
    goPrev,
    isWearingCurrent,
    wearCurrent,
    saving,
  } = useTodayFootwear({ outfit, todayTag });


  const renderBody = () => {

    if (error && loading) {
      return <p className="today-footwear-message">{error}</p>;
    }

    if (loading) {
      return <p className="today-footwear-message">Loading footwear...</p>;
    }

    if (!shoes.length) {
      return (
        <p className="today-footwear-message">
          Add footwear in My Wardrobe to get shoe suggestions here.
        </p>
      );
    }

    return (
      <>
        <div className="featured-outfit-content today-footwear-content">

          <div className="today-image-group">
            {current.imageUrl && (
              <img
                src={getImageUrl(current.imageUrl, 600)}
                alt={current.name}
                className="today-image"
              />
            )}
          </div>

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

        {error && (
          <p className="today-footwear-message">{error}</p>
        )}

        <div className="today-buttons">
          <button
            className="regular-button"
            onClick={wearCurrent}
            disabled={saving || isWearingCurrent}
          >
            {isWearingCurrent
              ? "Wearing today"
              : saving
                ? "Saving..."
                : "Wear these"}
          </button>
        </div>
      </>
    );
  };


  return (
    <div className="featured-outfit today-footwear-box">

      <h3 className="today-footwear-title">
        Shoes
      </h3>

      {renderBody()}

    </div>
  );
};


export default TodayFootwearBox;
