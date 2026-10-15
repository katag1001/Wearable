import React from "react";
import UploadImages from "../clothes/uploadImages";
import "../../styles/modal.css";

// Page one of the footwear form: name, image and type. Footwear has a
// single category, so every type is shown straight away (no category
// step or Back button, unlike clothing's ModalOne).
const FootwearModalOne = ({
  formData,
  updateField,
  chooseSubtype,
  setSelectedImage,
  footwearOptions,
  subtypeSuggestions
}) => {

  const selectSubtype = chooseSubtype;

  const renderSubtypeButton = (option) => (
    <button
      key={option.name}
      type="button"
      className={
        formData.subtype === option.name
          ? "selection-button selected"
          : "selection-button"
      }
      onClick={() => selectSubtype(option.name)}
    >
      <span className="selection-title">
        {option.name}
      </span>
    </button>
  );


  return (

    <div>

      {/* Name */}

      <label className="form-label">

        Name

        <input
          className="form-input"
          value={formData.name}
          onChange={e => updateField("name", e.target.value)}
          required
        />

      </label>


      {/* Image */}

      <div>

        <label className="form-label">
          Image
        </label>

        <div className="gap"></div>

        <UploadImages setSelectedImage={setSelectedImage} />

        <div className="gap"></div>

      </div>


      {/* Subtype */}

      <div className="form-label">

        Type

        {subtypeSuggestions.length > 0 && (

          <div className="upload-suggestions">

            <h3 className="selection-category-title">
              Suggested type
            </h3>

            <div className="selection-grid">
              {subtypeSuggestions.map(renderSubtypeButton)}
            </div>

          </div>

        )}


        <div className="selection-container">

          <div className="selection-category">

            <h3 className="selection-category-title">
              Footwear
            </h3>

            <div className="selection-grid">
              {footwearOptions.map(renderSubtypeButton)}
            </div>

          </div>

        </div>

      </div>

    </div>

  );
};


export default FootwearModalOne;
