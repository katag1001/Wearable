import React from "react";

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
    <>
      <div className="top-controls">

        <input
          className="clothing-search-bar"
          type="text"
          placeholder="Search clothes..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <button
          className="text-button"
          onClick={handleAddItem}
        >
          Add Item
        </button>

      </div>


      <div className="season-filters">

        {clothingTypes.map(type => (

          <button
            key={type}
            className={`text-button ${
              selectedType === type
                ? "active"
                : ""
            }`}
            onClick={() =>
              toggleTypeFilter(type)
            }
          >
            {typeTitles[type]}
          </button>

        ))}


        <button
          className="text-button"
          onClick={() =>
            setShowFilters(true)
          }
        >
          More Filters
        </button>

      </div>
    </>
  );
};

export default ViewClothesTop;