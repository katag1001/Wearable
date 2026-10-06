import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { tagOptions } from "../../constants/optionsBank";
import { URL } from "../../config";
import "./viewMatches.css";
import "./viewMatchesCard.css";

import TemperatureSlider from "../general/temperatureSlider";
import MatchScoreBadge from "../general/matchScoreBadge";
import { getImageUrl } from "../../utils/getImageUrl";

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
}) => {
  const [updateData, setUpdateData] = useState(null);
  const [saving, setSaving] = useState(false);

  const cardRef = useRef(null);
  const togglingFavouriteRef = useRef(false);

  const getToken = () =>
    localStorage.getItem("token");

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1);

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

  setUpdateData({
    spring: match.spring || false,
    summer: match.summer || false,
    autumn: match.autumn || false,
    winter: match.winter || false,
    min_temp: match.min_temp ?? "",
    max_temp: match.max_temp ?? "",
    tags: match.tags || [],
  });
};


  const closeEditor = () => {
    onCollapse();
    setUpdateData(null);
  };

  /*
   * Form changes
   */
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setUpdateData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
   * Toggle tag
   */
  const toggleTag = (tagName) => {
    setUpdateData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(
            (tag) => tag !== tagName
          )
        : [...prev.tags, tagName],
    }));
  };

  /*
   * Save update
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();

    if (!token) {
      setError?.("No user logged in");
      return;
    }

    setSaving(true);

    const body = {
      spring: updateData.spring,
      summer: updateData.summer,
      autumn: updateData.autumn,
      winter: updateData.winter,
      min_temp: Number(updateData.min_temp),
      max_temp: Number(updateData.max_temp),
      tags: updateData.tags,
    };

    try {
      const response = await fetch(
        `${URL}/match/${match._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError?.(
          data?.error ||
            data?.message ||
            "Failed to update match"
        );
        return;
      }

      if (data.error) {
        setError?.(data.error);
        return;
      }

      closeEditor();
      refresh();
    } catch (err) {
      console.error("Update error:", err);
      setError?.("Failed to update match");
    } finally {
      setSaving(false);
    }
  };

  /*
   * Toggle favourite
   */
  const handleToggleFavourite = async (e) => {
    e.stopPropagation();

    // Ignore rapid repeat clicks while a request is in flight,
    // without visually disabling the button.
    if (togglingFavouriteRef.current) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError?.("No user logged in");
      return;
    }

    const newValue = !match.favourite;

    // Optimistically reflect the change locally instead of
    // waiting on (and paying the cost of) a full match refetch.
    onFavouriteToggle?.(match._id, newValue);

    togglingFavouriteRef.current = true;

    try {
      const response = await fetch(
        `${URL}/match/${match._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            favourite: newValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Roll back the optimistic update on failure.
        if (onFavouriteToggle) {
          onFavouriteToggle(match._id, !newValue);
        } else {
          refresh();
        }

        setError?.(
          data?.error ||
            data?.message ||
            "Failed to update favourite"
        );
        return;
      }

      if (!onFavouriteToggle) {
        refresh();
      }
    } catch (err) {
      console.error("Favourite toggle error:", err);

      if (onFavouriteToggle) {
        onFavouriteToggle(match._id, !newValue);
      } else {
        refresh();
      }

      setError?.("Failed to update favourite");
    } finally {
      togglingFavouriteRef.current = false;
    }
  };

  /*
   * Render favourite heart button
   */
  const renderFavouriteButton = () => (
    <button
      type="button"
      className={
        match.favourite
          ? "favourite-heart-button favourited"
          : "favourite-heart-button"
      }
      onClick={handleToggleFavourite}
      aria-pressed={!!match.favourite}
      aria-label={
        match.favourite
          ? "Remove from favourites"
          : "Add to favourites"
      }
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

  /*
   * Render tags on collapsed card hover
   */
  const renderMatchTags = () => {
    if (!match.tags?.length) return null;

    return (
      <div className="hover-tags-row">
        {match.tags.map((tagName) => {
          const tag = tagOptions.find(
            (option) =>
              option.name === tagName
          );

          return (
            tag && (
              <img
                key={tagName}
                src={tag.image}
                alt={tagName}
                title={tagName}
                className="hover-tag-image"
              />
            )
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={
        isExpanded
          ? "match-card expanded"
          : "match-card"
      }
      onClick={handleCardClick}
    >
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

        {!isExpanded && renderMatchTags()}
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
              {[
                "spring",
                "summer",
                "autumn",
                "winter",
              ]
                .filter(
                  (season) => match[season]
                )
                .map(capitalize)
                .join(", ") || "N/A"}
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
                {[
                  "spring",
                  "summer",
                  "autumn",
                  "winter",
                ].map((season) => (
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
                      onChange={handleChange}
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
                min={-20}
                max={50}
                valueMin={Number(
                  updateData.min_temp
                )}
                valueMax={Number(
                  updateData.max_temp
                )}
                step={1}
                onChange={(
                  minTemp,
                  maxTemp
                ) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    min_temp: minTemp,
                    max_temp: maxTemp,
                  }))
                }
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
                      <img
                        src={tag.image}
                        alt={tag.name}
                        className="matches-selection-img"
                      />

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
