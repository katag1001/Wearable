import React from "react";
import UploadImages from "../clothes/uploadImages";
import TypePicker from "../clothes/uploadComponents/typePicker";
import "../../styles/modal.css";

// Page one of the footwear form: name, image and type. Footwear has a
// single category, so every type is shown straight away (TypePicker
// without categories).
const FootwearModalOne = ({
  formData,
  updateField,
  chooseSubtype,
  setSelectedImage,
  footwearOptions,
  subtypeSuggestions
}) => {

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

        <TypePicker
          formData={formData}
          chooseSubtype={chooseSubtype}
          typeOptions={footwearOptions}
          subtypeSuggestions={subtypeSuggestions}
          hasCategories={false}
        />

      </div>

    </div>

  );
};


export default FootwearModalOne;
