import React, {
  useEffect,
  useRef,
} from "react";

import { tagOptions } from "@core/constants/optionsBank.js";
import "./viewMatches.css";
import "./viewMatchesCard.css";
import "./matchSelection.css";

import TemperatureSlider from "../general/temperatureSlider";
import MatchScoreBadge from "../general/matchScoreBadge";
import FavouriteHeartButton from "../general/favouriteHeartButton";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import { useMatchCard } from "@core/hooks/useMatchCard.js";
import {
  TEMPERATURE_RANGE,
  formatMatchSeasons,
} from "@core/matches/matchFields.js";
import { seasonOptions } from "@core/constants/optionsBank.js";

const ViewMatchesCard = ({
  match,
  isExpanded,
  onExpand,
  onCollapse,
  onDelete,
  refresh,
  setError,
  editable = true,
  onFavouriteToggle,
  isSelected = false,
  onToggleSelect,
}) => {
  // The card logic lives in useMatchCard (shared with the mobile app).
  const card = useMatchCard({
    match,
    onChanged: refresh,
    onFavouriteToggle,
    onError: setError,
  });

  const {
    draft: updateData,
    saving,
    markingWorn,
    wornToday,
    toggleTag,
  } = card;

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  const cardRef = useRef(null);

  /*
   * Scroll the expanded card into the center
   * of the viewport after it expands.
   */
  useEffect(() => {
    if (!isExpanded || !cardRef.current) {
      return;
    }

    // Wait for the grid to finish reflowing
    // before calculating the card's position.
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });
  }, [isExpanded]);

  /*
   * Open / close editor
   */
  const handleCardClick = () => {
    if (!editable) {
      return;
    }

    if (isExpanded) {
      closeEditor();
      return;
    }

    onExpand();
    card.startEditing();
  };

  const closeEditor = () => {
    onCollapse();
    card.stopEditing();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (await card.save()) {
      onCollapse();
    }
  };

  const handleMarkAsWorn = () => card.markWorn();

  /*
   * Render favourite heart button
   */
  const renderFavouriteButton = () => (
    <FavouriteHeartButton
      favourite={match.favourite}
      onToggle={card.toggleFavourite}
    />
  );

  /*
   * Render multi-select tick box (top left)
   */
  const renderSelectBox = () => (
    <button
      type="button"
      role="checkbox"
      className={
        isSelected
          ? "match-select-box selected"
          : "match-select-box"
      }
      onClick={(e) => {
        e.stopPropagation();
        onToggleSelect(match._id);
      }}
      aria-checked={isSelected}
      aria-label={
        isSelected
          ? "Deselect outfit"
          : "Select outfit"
      }
    >
      <svg
        className="match-select-tick"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </button>
  );

  /*
   * Render clothing image
   */
  const renderItemImage = (item) => {
    if (!item?.imageUrl) return null;

    return (
      <img
        src={getImageUrl(item.imageUrl, 400)}
        alt={item.name}
        className="match-image"
        loading="lazy"
        decoding="async"
      />
    );
  };

  return (
    <div
      ref={cardRef}
      className={[
        "match-card",
        isExpanded && "expanded",
        isSelected && "selected",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleCardClick}
    >
      {!isExpanded &&
        editable &&
        onToggleSelect &&
        renderSelectBox()}

      {!isExpanded && renderFavouriteButton()}

      {/* IMAGE SECTION */}

      <div className="match-image-wrapper">
        {isExpanded && renderFavouriteButton()}

        <div className="match-image-grid">
          {(match.clothes || []).map((item) => (
            <React.Fragment key={item._id}>
              {renderItemImage(item)}
            </React.Fragment>
          ))}
        </div>

      </div>

      {/* COLLAPSED CARD INFO */}

      {!isExpanded && (
        <div className="match-info">
          <div className="item-info">
            <div>
              {match.min_temp}° -{" "}
              {match.max_temp}°
            </div>

            <div>
              {formatMatchSeasons(match)}
            </div>

            <MatchScoreBadge match={match} />

            {/* Delete Button */}
            {editable && (
              <div className="match-card-button-row">
                <button
                  type="button"
                  className="match-card-delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(match._id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPANDED EDITOR */}

      {isExpanded && updateData && (
        <div
          className="match-editor"
          onClick={(e) => e.stopPropagation()}
        >
          <form
            className="inline-update-form"
            onSubmit={handleSubmit}
          >
            {/* CLOSE */}

            <button
              type="button"
              className="inline-close-button"
              onClick={closeEditor}
            >
              ×
            </button>

            {/* SEASONS */}

            <div className="editor-section">
              <label className="form-label">
                Seasons
              </label>

              <fieldset className="season-group">
                {seasonOptions.map((season) => (
                  <label
                    key={season}
                    className="season-label"
                  >
                    <input
                      type="checkbox"
                      id={`${match._id}-${season}`}
                      name={season}
                      checked={
                        updateData[season]
                      }
                      onChange={() =>
                        card.toggleSeason(season)
                      }
                    />

                    {" "}

                    {capitalize(season)}
                  </label>
                ))}
              </fieldset>
            </div>

            {/* TEMPERATURE */}

            <div className="editor-section">
              <label className="form-label">
                Temperature Range
              </label>

              <TemperatureSlider
                min={TEMPERATURE_RANGE.min}
                max={TEMPERATURE_RANGE.max}
                valueMin={Number(
                  updateData.min_temp
                )}
                valueMax={Number(
                  updateData.max_temp
                )}
                step={1}
                onChange={card.setTemperature}
              />
            </div>

            {/* TAGS */}

            <div className="editor-section tags-section">
              <div className="form-label">
                Tags
              </div>

              <div className="matches-selection-grid">
                {tagOptions.map((tag) => (
                  <div
                    className="matches-selection-item"
                    key={tag.name}
                  >
                    <button
                      type="button"
                      className={
                        updateData.tags.includes(
                          tag.name
                        )
                          ? "matches-selection-button selected"
                          : "matches-selection-button"
                      }
                      onClick={() =>
                        toggleTag(tag.name)
                      }
                    >
                      <span className="matches-selection-title">
                        {tag.name}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* BUTTONS */}

            <div className="inline-editor-actions">
              <button
                type="button"
                className="match-text-button"
                onClick={() =>
                  onDelete(match._id)
                }
              >
                Delete
              </button>

              <button
                type="button"
                className="modal-button secondary"
                onClick={handleMarkAsWorn}
                disabled={markingWorn || wornToday}
              >
                {wornToday
                  ? "Worn Today"
                  : markingWorn
                    ? "Marking..."
                    : "Mark as Worn Today"}
              </button>

              <button
                type="submit"
                className="modal-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ViewMatchesCard;
