import React from "react";
import { seasonOptions, colorOptions, tagOptions } from "../../../constants/optionsBank";
import TemperatureSlider from "../../general/temperatureSlider";

const ModalTwo = ({
  formData,
  toggleSeason,
  handleTempChange,
  toggleColor,
  toggleTag
}) => {

  return (

    <div className="modal-page">

    {/* Season */}

        <div>

          <fieldset className="season-group">
            <label className="form-label">Seasons</label>
            {seasonOptions.map(season => (
              <label
                key={season}
                className="season-label"
              >

                <input
                  type="checkbox"
                  checked={formData[season]}
                  onChange={() =>
                    toggleSeason(season)
                  }
                />

                {" "}
                {season}

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
            valueMin={formData.min_temp}
            valueMax={formData.max_temp}
            onChange={(minTemp, maxTemp) => {
              handleTempChange("min_temp", minTemp);
              handleTempChange("max_temp", maxTemp);
            }}
          />
        </div>


    {/* Colours */}

    <div className="color-section">

      <div className="form-label">
        Colours
      </div>

      <div className="color-grid">
        {colorOptions.map((color) => (
          <div className="color-item" key={color.name}>

            <span>{color.name}</span>

            <div
              className={
                formData.colors.includes(color.name)
                  ? "color-square selected"
                  : "color-square"
              }
              style={{
                backgroundColor: color.value,
              }}
              onClick={() => toggleColor(color.name)}
            />

          </div>
        ))}
      </div>

    </div>


    {/* Tags */}

    <div className="tags-section">

      <div className="form-label">
        Tags
      </div>

      <div className="tags-selection-grid">

        {tagOptions.map(tag => (

          <div
            className="tags-selection-item"
            key={tag.name}
          >

            <button
              type="button"
              className={
                formData.tags.includes(tag.name)
                  ? "tags-selection-button selected"
                  : "tags-selection-button"
              }
              onClick={() => toggleTag(tag.name)}
            >

              <img
                src={tag.image}
                alt={tag.name}
                className="tags-selection-img"
              />

              <span className="tags-selection-title">
                {tag.name}
              </span>

            </button>

          </div>

        ))}

      </div>

    </div>

        </div>

      );
    };


export default ModalTwo;
