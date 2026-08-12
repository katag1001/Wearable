import React, { useState, useEffect } from "react";
import "../../styles/modal.css";
import { URL } from "../../config";
import TemperatureSlider from "../general/temperatureSlider";
import { tagOptions } from "../../constants/optionsBank";

const UpdateMatches = ({ match, onClose, onUpdateSuccess, onError }) => {
  const [updateData, setUpdateData] = useState({
    spring: false,
    summer: false,
    autumn: false,
    winter: false,
    min_temp: "",
    max_temp: "",
    tags: [],
  });

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    if (match) {
      setUpdateData({
        spring: match.spring || false,
        summer: match.summer || false,
        autumn: match.autumn || false,
        winter: match.winter || false,
        min_temp: match.min_temp ?? "",
        max_temp: match.max_temp ?? "",
        tags: match.tags || [],
      });
    }
  }, [match]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setUpdateData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleTag = (tagName) => {
    setUpdateData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((tag) => tag !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      onError("No user logged in");
      return;
    }

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
      const url = `${URL}/match/${match._id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        onError(data?.error || data?.message || "Failed to update match");
        return;
      }

      if (data.error) {
        onError(data.error);
      } else {
        onUpdateSuccess(data);
        onClose();
      }
    } catch (err) {
      console.error("💥 Update error:", err);
      onError("Failed to update match");
    }
  };

  return (
    <div className="match-editor-overlay">
      <div className="match-editor-container">

        <button
          className="match-editor-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <p className="match-editor-heading">
          Edit Match
        </p>

        <form
          className="match-editor-form"
          onSubmit={handleSubmit}
        >

          {/* Seasons */}
          <div className="match-editor-section">
            <fieldset className="match-editor-seasons">
              <label className="match-editor-label">
                Seasons
              </label>

              <div className="match-editor-season-list">
                {["spring", "summer", "autumn", "winter"].map(
                  (season) => (
                    <label
                      key={season}
                      className="match-editor-season-option"
                    >
                      <input
                        type="checkbox"
                        id={`match-${season}`}
                        name={season}
                        checked={updateData[season]}
                        onChange={handleChange}
                        className="match-editor-season-checkbox"
                      />

                      <span className="match-editor-season-text">
                        {season.charAt(0).toUpperCase() +
                          season.slice(1)}
                      </span>
                    </label>
                  )
                )}
              </div>
            </fieldset>
          </div>

          {/* Temperature */}
          <div className="match-editor-section">
            <label className="match-editor-label">
              Temperature Range
            </label>

            <div className="match-editor-temperature">
              <TemperatureSlider
                min={-20}
                max={50}
                valueMin={Number(updateData.min_temp)}
                valueMax={Number(updateData.max_temp)}
                step={1}
                onChange={(minTemp, maxTemp) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    min_temp: minTemp,
                    max_temp: maxTemp,
                  }))
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div className="match-editor-tags">
            <div className="match-editor-label">
              Tags
            </div>

            <div className="match-editor-tag-grid">
              {tagOptions.map((tag) => (
                <div
                  className="match-editor-tag-item"
                  key={tag.name}
                >
                  <button
                    type="button"
                    className={
                      updateData.tags.includes(tag.name)
                        ? "match-editor-tag-button match-editor-tag-active"
                        : "match-editor-tag-button"
                    }
                    onClick={() => toggleTag(tag.name)}
                  >
                    <img
                      src={tag.image}
                      alt={tag.name}
                      className="match-editor-tag-image"
                    />

                    <span className="match-editor-tag-name">
                      {tag.name}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="match-editor-actions">
            <button
              type="submit"
              className="match-editor-save"
            >
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateMatches;
