import React, { useState } from "react";
import '../../styles/pagesTop.css'


const ViewClothesTop = ({
  searchTerm,
  setSearchTerm,
  clothingTypes,
  typeTitles,
  selectedType,
  toggleTypeFilter,
  // { top: ["Shirt", ...], bottom: [...], ... } - only subtypes the user owns
  subtypesByType = {},
  selectedSubtypes = [],
  toggleSubtypeFilter,
  setShowFilters
}) => {

  // The type whose subtypes are showing in the row below the type
  // buttons - set while hovering / focusing a type button.
  const [previewType, setPreviewType] = useState(null);

  const previewSubtypes = previewType
    ? subtypesByType[previewType] || []
    : [];

  // Closes the subtype row once focus leaves the whole selection area
  // (moving between a type button and its subtypes keeps it open).
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setPreviewType(null);
    }
  };

  const typeLabel = (type) => {
    const count =
      selectedType === type ? selectedSubtypes.length : 0;

    return count > 0
      ? `${typeTitles[type]} · ${count}`
      : typeTitles[type];
  };

  return (
    <div className="top-area-wrapper">

      <div
        className="top-selection-area"
        onMouseLeave={() => setPreviewType(null)}
        onBlur={handleBlur}
      >

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
              onMouseEnter={() => setPreviewType(type)}
              onFocus={() => setPreviewType(type)}
            >
              {typeLabel(type)}
            </button>

          ))}

        </div>

        {previewSubtypes.length > 0 && (
          <div
            className="subtype-option-row"
            aria-label={`${typeTitles[previewType]} subtypes`}
          >
            {previewSubtypes.map((subtype) => {
              const active =
                selectedType === previewType &&
                selectedSubtypes.includes(subtype);

              return (
                <button
                  key={subtype}
                  type="button"
                  className={`subtype-option-button ${
                    active ? "subtype-option-active" : ""
                  }`}
                  aria-pressed={active}
                  onClick={() =>
                    toggleSubtypeFilter(previewType, subtype)
                  }
                >
                  {subtype}
                </button>
              );
            })}
          </div>
        )}
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
