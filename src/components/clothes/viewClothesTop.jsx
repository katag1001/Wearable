import React from "react";
import '../../styles/pagesTop.css'


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
    <div className="top-area-wrapper">


      <button
        className="top-action-button"
        onClick={handleAddItem}
      >
        Add Item
      </button>


      <div className="top-selection-area">

        <div className="top-option-row">

          {clothingTypes.map((type) => (

            <button
              key={type}
              className={`top-option-button ${
                selectedType === type
                  ? "top-option-active"
                  : ""
              }`}
              onClick={() => toggleTypeFilter(type)}
            >
              {typeTitles[type]}
            </button>

          ))}

        </div>
      </div>

      <div className="top-search-row">

        <button
          className="top-filter-button"
          onClick={() => setShowFilters(true)}
        >
          <span className="top-filter-icon">☰</span>
          Filters
        </button>

        <div className="top-search-box">

          <input
            type="text"
            placeholder="Search clothes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="top-search-input"
          />

        </div>

      </div>

    </div>
  );
};

export default ViewClothesTop;