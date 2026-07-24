import React from "react";
import UploadImages from "../uploadPics";
import typeOptions from "../../../constants/typeOptions";
import { suggestSubtypesFromName } from "./uploadHelpers";


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
    <div className="modal-page">

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

            <div className="subtype-grid">
              {subtypeSuggestions.map(suggestion => (
                <button
                  key={suggestion.name}
                  type="button"
                  className={
                    formData.subtype === suggestion.name
                      ? "subtype-button selected"
                      : "subtype-button"
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
                    className="subtype-icon"
                  />

                  <span>
                    {suggestion.name}
                  </span>
                </button>

              ))}

            </div>

          </div>

        )}



        <div className="subtype-container">

          {Object.entries(groupedTypes).map(
            ([category, subtypes]) => (

              <div
                key={category}
                className="subtype-category"
              >

                <h4>
                  {category}
                </h4>


                <div className="subtype-grid">

                  {subtypes.map(subtype => (

                    <button
                      type="button"
                      key={subtype.name}
                      className={
                        formData.subtype === subtype.name
                          ? "subtype-button selected"
                          : "subtype-button"
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
                        className="subtype-icon"
                      />


                      <span>
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
