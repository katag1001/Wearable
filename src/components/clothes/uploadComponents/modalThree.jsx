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
      
      <div>
        <h4>Colours</h4>

        {suggestedColors.length > 0 && (

          <div className="subtype-suggestions">

            <h4>
              Selected:
            </h4>

            <div className="suggestion-grid">

              {suggestedColors.map(color => (

                <button
                  key={color.name}
                  type="button"
                  className="suggestion-button"
                  onClick={() =>
                    toggleColor(color.name)
                  }
                >

                  <div
                    className="color-square selected"
                    style={{
                      backgroundColor: color.value
                    }}
                  />

                  <span>
                    {color.name}
                  </span>

                </button>

              ))}

            </div>

          </div>

        )}

        <div className="color-grid">

          {colorOptions.map(color => (

            <div key={color.name}>

              <span>
                {color.name}
              </span>

              <div
                className={
                  formData.colors.includes(color.name)
                    ? "color-square selected"
                    : "color-square"
                }
                style={{
                  backgroundColor: color.value
                }}
                onClick={() =>
                  toggleColor(color.name)
                }
              />

            </div>

          ))}

        </div>

      </div>

      <div>

        <h4>
          Tags
        </h4>

        {suggestedTags.length > 0 && (

          <div className="subtype-suggestions">

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