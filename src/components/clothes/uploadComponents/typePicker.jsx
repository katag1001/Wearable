import React, { useState } from "react";
import {
  getCategories,
  getCategoryOf,
  getOptionsInCategory,
} from "@core/wardrobe/typeChoices.js";
import "../../../styles/modal.css";

/*
 * Choosing an item's type: suggestions from the name, then (clothing,
 * `hasCategories`) a category and the types in it, or (footwear) every
 * type straight away. Used by the item form's first page (ModalOne,
 * FootwearModalOne) and the review after a photo is analysed.
 */
const TypePicker = ({
  formData,
  chooseSubtype,
  typeOptions,
  subtypeSuggestions = [],
  hasCategories,
}) => {

  const [selectedCategory, setSelectedCategory] = useState(
    () => getCategoryOf(typeOptions, formData.subtype)
  );

  const renderSubtypeButton = (option) => (
    <button
      key={option.name}
      type="button"
      className={
        formData.subtype === option.name
          ? "selection-button selected"
          : "selection-button"
      }
      onClick={() => {
        if (option.category) {
          setSelectedCategory(option.category);
        }

        chooseSubtype(option.name);
      }}
    >
      <span className="selection-title">
        {option.name}
      </span>
    </button>
  );

  return (

    <>

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

        {!hasCategories && (

          <div className="selection-category">

            <h3 className="selection-category-title">
              Footwear
            </h3>

            <div className="selection-grid">
              {typeOptions.map(renderSubtypeButton)}
            </div>

          </div>

        )}


        {hasCategories && !selectedCategory && (

          <div className="selection-category">

            <h3 className="selection-category-title">
              Category
            </h3>

            <div className="selection-grid">

              {getCategories(typeOptions).map(category => (

                <button
                  type="button"
                  key={category}
                  className="selection-button"
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="selection-title">
                    {category}
                  </span>
                </button>

              ))}

            </div>

          </div>

        )}


        {hasCategories && selectedCategory && (

          <div className="selection-category">

            <button
              type="button"
              className="modal-button secondary"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back
            </button>

            <div className="gap"></div>

            <h3 className="selection-category-title">
              {selectedCategory}
            </h3>

            <div className="selection-grid">
              {getOptionsInCategory(typeOptions, selectedCategory).map(renderSubtypeButton)}
            </div>

          </div>

        )}

      </div>

    </>

  );
};


export default TypePicker;
