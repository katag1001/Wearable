import React from "react";
import './viewClothesTop.css'

const ViewClothesTop = ({
  searchTerm,
  setSearchTerm,
  handleAddItem,
  clothingTypes,
  typeTitles,
  selectedType,
  toggleTypeFilter,
  setShowFilters
}) => {

  return (
    <div className="wardrobe-top-wrapper">


      <button
        className="wardrobe-action-button"
        onClick={handleAddItem}
      >
        Add Item
      </button>


      <div className="wardrobe-selection-area">

        <div className="wardrobe-option-row">

          {clothingTypes.map((type) => (

            <button
              key={type}
              className={`wardrobe-option-button ${
                selectedType === type
                  ? "wardrobe-option-active"
                  : ""
              }`}
              onClick={() => toggleTypeFilter(type)}
            >
              {typeTitles[type]}
            </button>

          ))}

        </div>
      </div>

      <div className="wardrobe-search-row">

        <button
          className="wardrobe-filter-button"
          onClick={() => setShowFilters(true)}
        >
          <span className="wardrobe-filter-icon">☰</span>
          Filters
        </button>

        <div className="wardrobe-search-box">

          <input
            type="text"
            placeholder="Search clothes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wardrobe-search-input"
          />

          <span className="wardrobe-search-icon">
            🔍
          </span>

        </div>

      </div>

    </div>
  );
};

export default ViewClothesTop;