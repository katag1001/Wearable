import React, { useState } from "react";
import "./viewToday.css";
import MessagePopup from "../general/messagePopup.jsx";
import DeletePopup from "../general/deletePopup.jsx";
import MatchScoreBadge from "../general/matchScoreBadge.jsx";
import { useToday } from "@core/hooks/useToday.js";
import { tagOptions } from "@core/constants/optionsBank.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import TodayFootwearBox from "./footwear/todayFootwearBox.jsx";


// The Today outfits. The logic is useToday (shared with the mobile app);
// this renders it and owns the delete confirmation.
const ViewToday = ({ todayReady }) => {

  const {
    loading,
    checkingToday,
    message,
    outfits,
    filteredOutfits,
    selectedOutfit,
    goNext,
    goPrev,
    todayTag,
    selectedTag,
    selectTag,
    wornToday,
    wornOutfit,
    showSelector,
    showOutfitPicker,
    markAsWornToday,
    deleteCurrentOutfit,
    deleting: deletingOutfit,
    notice,
    clearNotice,
  } = useToday({ todayReady });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Closes the confirmation straight away - the delete carries on in the
  // background.
  const deleteOutfit = () => {
    setShowDeleteConfirm(false);
    deleteCurrentOutfit();
  };


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

  const renderOutfitImages = (outfit) => {

    return (
      <div className="today-image-group">

        {(outfit?.matchId?.clothes || [])
          .map(renderItemImage)
          .filter(Boolean)}

      </div>
    );
  };


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

      {wornToday && !showSelector ? (

        /* ------------------------- WORN CARD VIEW ------------------------- */

        <div className="today-worn-section">

          <div className="featured-outfit">

            <div className="featured-outfit-content">

              <MatchScoreBadge
                match={wornOutfit?.matchId}
                overlay
              />

              {renderOutfitImages(
                wornOutfit
              )}

            </div>


            <div className="today-buttons">

              <button
                className="regular-button"
                onClick={showOutfitPicker}
              >
                Select a different outfit
              </button>

            </div>

          </div>


          {/* SHOES FOR THE WORN OUTFIT */}

          <TodayFootwearBox
            outfit={wornOutfit}
            todayTag={todayTag}
          />

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
                  selectedOutfit
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


          {/* ONLY SHOW BUTTON WHEN AN OUTFIT EXISTS */}

          {filteredOutfits.length > 0 && (

            <div className="today-buttons">

              <button
                className="regular-button"
                onClick={
                  markAsWornToday
                }
              >
                Mark as Worn Today
              </button>

              <button
                className="regular-button delete-outfit-button"
                onClick={() =>
                  setShowDeleteConfirm(true)
                }
              >
                Delete Outfit
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


      {/* DELETE CONFIRMATION */}

      <DeletePopup
        isOpen={showDeleteConfirm}
        title="Delete Outfit"
        message="Are you sure you want to delete this outfit permanently? This cannot be undone."
        loading={deletingOutfit}
        onConfirm={deleteOutfit}
        onClose={() => {
          if (!deletingOutfit) {
            setShowDeleteConfirm(false);
          }
        }}
      />

    </div>
  );
};


export default ViewToday;
