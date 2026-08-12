import React, { useState } from "react";

import { tagOptions } from "../../constants/optionsBank";
import { URL } from "../../config";
import "./viewMatches.css";
import "./viewMatchesCard.css";

import TemperatureSlider from "../general/temperatureSlider";

const ViewMatchCard = ({
  match,
  onDelete,
  refresh,
  setError,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updateData, setUpdateData] = useState(null);
  const [saving, setSaving] = useState(false);

  const getToken = () =>
    localStorage.getItem("token");

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  /*
   * Open / close inline editor
   */
  const handleCardClick = () => {
    if (isExpanded) {
      closeEditor();
      return;
    }

    setIsExpanded(true);

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

  /*
   * Close inline editor
   */
  const closeEditor = () => {
    setIsExpanded(false);
    setUpdateData(null);
  };

  /*
   * Handle season changes
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
   * Handle tag selection
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
   * Save match
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
   * Render individual clothing image
   */
  const renderItemImage = (item) => {
    if (!item?.imageUrl) return null;

    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        className="match-image"
      />
    );
  };

  /*
   * Render tags on collapsed card
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
      className={
        isExpanded
          ? "match-card expanded"
          : "match-card"
      }
      onClick={handleCardClick}
    >
      {/* =========================
          IMAGE SECTION
      ========================== */}

      <div className="match-image-wrapper">
        <div className="match-image-grid">
          {(match.clothes || []).map((item) => (
            <React.Fragment key={item._id}>
              {renderItemImage(item)}
            </React.Fragment>
          ))}
        </div>

        {!isExpanded && renderMatchTags()}
      </div>

      {/* =========================
          COLLAPSED CARD INFO
      ========================== */}

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
          </div>

          <div className="match-items-button-row">
            <button
              className="match-text-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(match._id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* =========================
          EXPANDED EDITOR
      ========================== */}

      {isExpanded && updateData && (
        <div
          className="match-editor"
          onClick={(e) => e.stopPropagation()}
        >
          <form
            className="update-form inline-update-form"
            onSubmit={handleSubmit}
          >
            {/* Close */}

            <button
              type="button"
              className="inline-close-button"
              onClick={closeEditor}
            >
              ×
            </button>

            {/* Seasons */}

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

            {/* Temperature */}

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

              <div className="temperature-values">
                <span>
                  {updateData.min_temp}°
                </span>

                <span>
                  {updateData.max_temp}°
                </span>
              </div>
            </div>

            {/* Tags */}

            <div className="editor-section tags-section">
              <div className="form-label">
                Tags
              </div>

              <div className="selection-grid">
                {tagOptions.map((tag) => (
                  <div
                    className="selection-item"
                    key={tag.name}
                  >
                    <button
                      type="button"
                      className={
                        updateData.tags.includes(
                          tag.name
                        )
                          ? "selection-button selected"
                          : "selection-button"
                      }
                      onClick={() =>
                        toggleTag(tag.name)
                      }
                    >
                      <img
                        src={tag.image}
                        alt={tag.name}
                        className="selection-img"
                      />

                      <span className="selection-title">
                        {tag.name}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}

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

export default ViewMatchCard;
