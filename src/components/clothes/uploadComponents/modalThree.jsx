import React from "react";

import {
  colorOptions,
  tagOptions
} from "../../../constants/optionsBank";

import '../../../styles/modal.css' 

const ModalThree = ({
  formData,
  toggleColor,
  toggleTag,
  updateField
}) => {

  const suggestedColors = colorOptions.filter(color =>
    formData.colors.includes(color.name)
  );

  const suggestedTags = tagOptions.filter(tag =>
    formData.tags.includes(tag.name)
  );

  return (
    <div className="modal-page">

    {/* Colours */}
      <div className="color-section">

        {suggestedColors.length > 0 && (
          <div className="upload-suggestions">

            <div className="form-label">
              Selected
            </div>

            <div className="color-grid">
              {suggestedColors.map((color) => (
                <div className="color-item" key={color.name}>
                  <button
                    type="button"
                    className="color-button"
                    onClick={() => toggleColor(color.name)}
                  >
                    <div
                      className="color-square selected"
                      style={{
                        backgroundColor: color.value,
                      }}
                    />

                    <span>{color.name}</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

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

        <div className="selection-grid">

          {tagOptions.map(tag => (

            <div
              className="selection-item"
              key={tag.name}
            >

              <button
                type="button"
                className={
                  formData.tags.includes(tag.name)
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


    </div>
  );
};

export default ModalThree;