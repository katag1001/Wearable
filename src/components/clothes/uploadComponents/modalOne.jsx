import React, { useState } from "react";
import UploadImages from "../uploadImages";
import { suggestSubtypesFromName } from "./uploadHelpers";
import "../../../styles/modal.css";


const ModalOne = ({
  formData,
  updateField,
  handleSubtypeChange,
  setSelectedImage,
  typeOptions
}) => {


  const [selectedCategory, setSelectedCategory] = useState(
    () =>
      typeOptions.find(
        option => option.name === formData.subtype
      )?.category || null
  );


  const categories = [
    ...new Set(
      typeOptions.map(option => option.category)
    )
  ];


  const subtypesInCategory = typeOptions.filter(
    option => option.category === selectedCategory
  );


  const subtypeSuggestions =
    suggestSubtypesFromName(
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


        {subtypeSuggestions.length > 0 && (

          <div className="upload-suggestions">

            <h3 className="selection-category-title">
              Suggested type
            </h3>


            <div className="selection-grid">

              {subtypeSuggestions.map(
                suggestion => (

                  <button
                    key={suggestion.name}
                    type="button"
                    className={
                      formData.subtype ===
                      suggestion.name
                        ? "selection-button selected"
                        : "selection-button"
                    }
                    onClick={() => {

                      setSelectedCategory(
                        suggestion.category
                      );

                      handleSubtypeChange({
                        target: {
                          value:
                            suggestion.name
                        }
                      });

                    }}
                  >

                    <span className="selection-title">
                      {suggestion.name}
                    </span>

                  </button>

                )
              )}

            </div>

          </div>

        )}


        <div className="selection-container">

          {!selectedCategory && (

            <div className="selection-category">

              <h3 className="selection-category-title">
                Category
              </h3>


              <div className="selection-grid">

                {categories.map(
                  category => (

                    <button
                      type="button"
                      key={category}
                      className="selection-button"
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                    >

                      <span className="selection-title">
                        {category}
                      </span>

                    </button>

                  )
                )}

              </div>

            </div>

          )}


          {selectedCategory && (

            <div className="selection-category">

              <button
                type="button"
                className="modal-button secondary"
                onClick={() =>
                  setSelectedCategory(null)
                }
              >
                ← Back
              </button>

              <div className="gap"></div>

              <h3 className="selection-category-title">
                {selectedCategory}
              </h3>


              <div className="selection-grid">

                {subtypesInCategory.map(
                  subtype => (

                    <button
                      type="button"
                      key={subtype.name}
                      className={
                        formData.subtype ===
                        subtype.name
                          ? "selection-button selected"
                          : "selection-button"
                      }
                      onClick={() =>
                        handleSubtypeChange({
                          target: {
                            value:
                              subtype.name
                          }
                        })
                      }
                    >

                      <span className="selection-title">
                        {subtype.name}
                      </span>

                    </button>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );
};


export default ModalOne;
