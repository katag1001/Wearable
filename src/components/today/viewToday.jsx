import React, { useState } from "react";
import "./viewToday.css";
import MessagePopup from "../general/messagePopup.jsx";
import MatchScoreBadge from "../general/matchScoreBadge.jsx";
import { useTodayLook } from "@core/hooks/useTodayLook.js";
import { tagOptions } from "@core/constants/optionsBank.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import ShoeChooserModal from "./footwear/shoeChooserModal.jsx";
import OutfitFeedbackModal from "./outfitFeedbackModal.jsx";
import BrokenHeartIcon from "../general/brokenHeartIcon.jsx";
import HeartIcon from "../general/heartIcon.jsx";
import ShoeIcon from "../general/shoeIcon.jsx";
import StarRating from "../general/starRating.jsx";


// The Today outfits, each with its shoes. The logic is useTodayLook
// (shared with the mobile app); this renders it and owns the broken heart
// and Change shoes popups.
const ViewToday = ({ todayReady }) => {

  const today = useTodayLook({ todayReady });

  const {
    loading,
    checkingToday,
    message,
    outfits,
    filteredOutfits,
    selectedOutfit,
    goNext,
    goPrev,
    selectedRating,
    rateSelected,
    selectedTag,
    selectTag,
    todayTag,
    wornToday,
    wornOutfit,
    showSelector,
    showOutfitPicker,
    markAsWornToday,
    wearing,
    footwear,
    selectedShoe,
    wornShoe,
    chooseShoe,
    changeWornShoe,
    notice,
    clearNotice,
  } = today;

  const [showFeedback, setShowFeedback] = useState(false);
  const [showShoeChooser, setShowShoeChooser] = useState(false);

  const showingWorn = Boolean(wornToday) && !showSelector;


  /* ------------------------- IMAGE ------------------------- */

  const renderItemImage = (item) => {

    if (!item?.imageUrl) {
      return null;
    }


    return (
      <img
        key={item._id}
        src={getImageUrl(item.imageUrl, 800)}
        alt={item.name}
        className="today-image"
      />
    );
  };


  /* ------------------------- RENDER OUTFIT IMAGES ------------------------- */

  // The clothes, then the shoe - all laid out the same way.
  const renderOutfitImages = (outfit, shoe) => {

    return (
      <div className="today-image-group">

        {[...(outfit?.matchId?.clothes || []), shoe]
          .map(renderItemImage)
          .filter(Boolean)}

      </div>
    );
  };


  /* ------------------------- CHANGE SHOES BUTTON ------------------------- */

  const renderChangeShoesButton = () =>
    footwear.hasFootwear && (
      <button
        className="today-action-button today-action-button-small"
        onClick={() => setShowShoeChooser(true)}
        aria-label="Change shoes"
        title="Change shoes"
      >
        <ShoeIcon />
      </button>
    );


  /* ------------------------- RENDER STATES ------------------------- */

  if (!todayReady && loading) {

    return (
      <p className="today-message">
        Loading outfits...
      </p>
    );
  }


  if (
    loading ||
    checkingToday
  ) {

    return (
      <p className="today-message">
        Preparing today's outfits...
      </p>
    );
  }


  if (message) {

    return (
      <p className="today-message">
        {message}
      </p>
    );
  }


  /* ------------------------- MAIN RENDER ------------------------- */

  return (
    <div className="view-today-container">

      {showingWorn ? (

        /* ------------------------- WORN CARD VIEW ------------------------- */

        <div className="today-worn-section">

          <div className="featured-outfit">

            <div className="featured-outfit-content">

              <MatchScoreBadge
                match={wornOutfit?.matchId}
                overlay
              />

              {renderOutfitImages(
                wornOutfit,
                wornShoe
              )}

            </div>


            <div className="today-buttons">

              <button
                className="regular-button"
                onClick={showOutfitPicker}
              >
                Select a different outfit
              </button>

              {renderChangeShoesButton()}

            </div>

          </div>

        </div>

      ) : (

      <>

      {/* TOP SECTION */}

      <div className="today-top-section">

        {/* FEATURED / MAIN OUTFIT */}

        <div className="featured-outfit">

          <div className="featured-outfit-content">

            {filteredOutfits.length > 0 ? (
              <>
                <MatchScoreBadge
                  match={selectedOutfit?.matchId}
                  overlay
                />

                {renderOutfitImages(
                  selectedOutfit,
                  selectedShoe
                )}

                {/* Only on today's list thanks to its tights range */}
                {selectedOutfit?.withTights && (
                  <p className="today-tights-note">Remember a pair tights today!</p>
                )}

                {/* PREVIOUS / NEXT - next rejects the outfit being left */}

                {filteredOutfits.length > 1 && (
                  <>
                    <button
                      className="today-arrow-button today-arrow-prev"
                      onClick={goPrev}
                      aria-label="Previous outfit"
                    >
                      ‹
                    </button>

                    <button
                      className="today-arrow-button today-arrow-next"
                      onClick={goNext}
                      aria-label="Next outfit"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            ) : (

              <p className="today-message">
                {outfits.length === 0
                  ? "No outfits saved for today."
                  : "No outfits saved for this tag."}
              </p>

            )}

          </div>


          {/* STARS - saved once the outfit is left or worn */}

          {filteredOutfits.length > 0 && (
            <StarRating
              rating={selectedRating}
              onChange={rateSelected}
              className="today-star-rating"
            />
          )}


          {/* ONLY SHOW BUTTON WHEN AN OUTFIT EXISTS */}

          {filteredOutfits.length > 0 && (

            <div className="today-buttons today-action-row">

              {/* Too hot, too cold or a mismatch */}
              <button
                className="today-action-button"
                onClick={() => setShowFeedback(true)}
                aria-label="Not this outfit"
                title="Not this outfit"
              >
                <BrokenHeartIcon />
              </button>

              {renderChangeShoesButton()}

              <button
                className="today-action-button"
                onClick={
                  markAsWornToday
                }
                disabled={wearing}
                aria-label="Wear this outfit today"
                title="Wear this outfit today"
              >
                <HeartIcon />
              </button>

            </div>

          )}

        </div>


        {/* TAG SELECTOR */}

        <div className="today-tags-section">

          <div className="today-tags-title">
            Filter by Tag
          </div>

          {todayTag && (

            <p className="today-tag-note">
              Today's {todayTag} outfit
            </p>

          )}


          <div className="today-tag-selector">

            {tagOptions.map((tag) => {

              const isSelected =
                selectedTag ===
                tag.name;


              return (

                <button
                  key={tag.name}
                  className={`today-tag-option ${
                    isSelected
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectTag(
                      tag.name
                    )
                  }
                  aria-label={`Filter by ${tag.name}`}
                  aria-pressed={
                    isSelected
                  }
                >

                  <div className="today-tag-content">

                    <span>
                      {tag.name}
                    </span>


                    {isSelected && (

                      <span
                        className="today-tag-check"
                        aria-label="Selected"
                      >
                        ✓
                      </span>

                    )}

                  </div>

                </button>

              );

            })}

          </div>

        </div>

      </div>

      </>

      )}


      {/* POPUP */}

      <MessagePopup
        isOpen={!!notice}
        title={notice?.title}
        message={notice?.message}
        onClose={clearNotice}
      />


      {/* CHANGE SHOES - the worn outfit's are saved straight away */}

      {showShoeChooser && (
        <ShoeChooserModal
          footwear={footwear}
          outfit={showingWorn ? wornOutfit : selectedOutfit}
          startShoe={showingWorn ? wornShoe : selectedShoe}
          chooseLabel={showingWorn ? "Wear these" : "Choose these"}
          onChoose={showingWorn ? changeWornShoe : chooseShoe}
          onClose={() => setShowShoeChooser(false)}
        />
      )}


      {/* BROKEN HEART - too hot, too cold or a mismatch */}

      {showFeedback && (
        <OutfitFeedbackModal
          today={today}
          onClose={() => setShowFeedback(false)}
        />
      )}

    </div>
  );
};


export default ViewToday;
