import React from "react";
import UploadImages from "../uploadImages";
import TypePicker from "./typePicker";
import "../../../styles/modal.css";


const ModalOne = ({
  formData,
  updateField,
  chooseSubtype,
  setSelectedImage,
  typeOptions,
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
          onChange={e =>
            updateField(
              "name",
              e.target.value
            )
          }
          required
        />

      </label>


      {/* Image */}

      <div>

        <label className="form-label">
          Image
        </label>

        <div className="gap"></div>

        <UploadImages
          setSelectedImage={
            setSelectedImage
          }
        />
        <div className="gap"></div>

      </div>


      {/* Subtype */}

      <div className="form-label">

        Type

        <TypePicker
          formData={formData}
          chooseSubtype={chooseSubtype}
          typeOptions={typeOptions}
          subtypeSuggestions={subtypeSuggestions}
          hasCategories
        />

      </div>

    </div>

  );
};


export default ModalOne;
