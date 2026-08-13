import React from "react";
import UploadImages from "../uploadPics";
import typeOptions from "../../../constants/typeOptions";
import { suggestSubtypesFromName } from "./uploadHelpers";
import '../../../styles/modal.css' 


const ModalOne = ({
  formData,
  setFormData,
  updateField,
  handleSubtypeChange
}) => {


  const groupedTypes = typeOptions.reduce((groups, item) => {

    if (!groups[item.type]) {
      groups[item.type] = [];
    }

    groups[item.type].push(item);

    return groups;

  }, {});


  const subtypeSuggestions = suggestSubtypesFromName(
    formData.name,
    typeOptions
  );


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


      {/* Subtype */}
      <div className="form-label">
        Type
        {subtypeSuggestions.length > 0 && (

          <div className="upload-suggestions">

            <h3 className="selection-category-title">
                Suggested type
              </h3>

            <div className="selection-grid">
              {subtypeSuggestions.map(suggestion => (
                
                <button
                  key={suggestion.name}
                  type="button"
                  className={
                    formData.subtype === suggestion.name
                      ? "selection-button selected"
                      : "selection-button"
                  }
                  onClick={() =>
                    handleSubtypeChange({
                      target: {
                        value: suggestion.name
                      }
                    })
                  }
                >
                  <img
                    src={suggestion.icon}
                    alt={suggestion.name}
                    className="selection-img"
                  />

                  <span className="selection-title">
                    {suggestion.name}
                  </span>
                </button>

              ))}

            </div>

          </div>

        )}



        <div className="selection-container">

  {Object.entries(groupedTypes).map(
    ([category, subtypes]) => (

      <div
        key={category}
        className="selection-category"
      >

        <h3 className="selection-category-title">
          {category}
        </h3>

        <div className="selection-grid">

          {subtypes.map(subtype => (

            <button
              type="button"
              key={subtype.name}
              className={
                formData.subtype === subtype.name
                  ? "selection-button selected"
                  : "selection-button"
              }
              onClick={() =>
                handleSubtypeChange({
                  target: {
                    value: subtype.name
                  }
                })
              }
            >

              <img
                src={subtype.icon}
                alt={subtype.name}
                className="selection-img"
              />

              <span className="selection-title">
                {subtype.name}
              </span>

            </button>

          ))}

        </div>

      </div>

    )
  )}

</div>


      </div>


      {/* Image */}
      <div>
        <label className="form-label">Image</label>
        <UploadImages
          setFormData={setFormData}
          formData={formData}
        />
      </div>


    </div>
  );
};


export default ModalOne;
