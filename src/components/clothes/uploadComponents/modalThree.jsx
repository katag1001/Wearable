import React from "react";

import {styleOptions, colorOptions, tagOptions} from "../../general/optionsBank";

const ModalThree = ({
  formData,
  toggleColor,
  toggleTag,
  updateField
}) => {

  const handleStyleChange = (e) => {
    updateField(
      "styles",
      e.target.value
    );
  };


  return (
    <div className="modal-page">

      <div>
        <h4>Colours</h4>

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

      <label className="form-label">
        Style:
        <select
          className="form-select"
          value={formData.styles}
          onChange={handleStyleChange}
        >

          {styleOptions.map(style => (

            <option
              key={style}
              value={style}
            >
              {style}
            </option>

          ))}

        </select>
      </label>


      <div>

        <h4>
          Tags
        </h4>


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

