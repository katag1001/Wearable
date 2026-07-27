import React, { useState, useEffect } from "react";
import '../../styles/modal.css'
import { URL } from "../../config";
import TemperatureSlider from "../general/TemperatureSlider";
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

const toggleTag = (tagName) => {
  setUpdateData((prev) => ({
    ...prev,
    tags: prev.tags.includes(tagName)
      ? prev.tags.filter((tag) => tag !== tagName)
      : [...prev.tags, tagName],
  }));
};

  return (
    <div className="modal-backdrop">
      <div className="modal-wrapper">
      <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>

        <p className="modal-title">Edit Match</p>

        <form className="update-form" onSubmit={handleSubmit}>

        {/* Season */}
          <div>
            <fieldset className="season-group">
              <label className="form-label">Seasons</label>

              {["spring", "summer", "autumn", "winter"].map((season) => (
                <label key={season} className="season-label">
                  <input
                    type="checkbox"
                    id={season}
                    name={season}
                    checked={updateData[season]}
                    onChange={handleChange}
                  />
                  {" "}
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </label>
              ))}
            </fieldset>
          </div>


          {/* Temperature */}
          <div>
            <label className="form-label">
              Temperature Range
            </label>

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

          {/* Tags */}
          <div className="tags-section">

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
                        updateData.tags.includes(tag.name)
                          ? "selection-button selected"
                          : "selection-button"
                      }
                      onClick={() => toggleTag(tag.name)}
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

          {/* Nav */}
          <div className="modal-navigation">
            <button type="submit" className="modal-button">
              Save
            </button>


          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateMatches;