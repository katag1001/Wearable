import React from "react";

import {
  colorOptions,
  tagOptions
} from "../../../constants/optionsBank";

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
    formData.tags.includes(tag)
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
      <div>

      <div className="form-label">
        Tags
      </div>

        {suggestedTags.length > 0 && (

          <div className="upload-suggestions">

            <h4>
              Selected:
            </h4>

            <div className="suggestion-grid">

              {suggestedTags.map(tag => (

                <button
                  key={tag}
                  type="button"
                  className="suggestion-button"
                  onClick={() =>
                    toggleTag(tag)
                  }
                >

                  <input
                    type="checkbox"
                    checked
                    readOnly
                  />

                  <span>
                    {tag}
                  </span>

                </button>

              ))}

            </div>

          </div>

        )}

        {tagOptions.map(tag => (

          <label key={tag}>

            <input
              type="checkbox"
              checked={
                formData.tags.includes(tag)
              }
              onChange={() =>
                toggleTag(tag)
              }
            />

            {" "}
            {tag}

          </label>

        ))}

      </div>

    </div>
  );
};

export default ModalThree;