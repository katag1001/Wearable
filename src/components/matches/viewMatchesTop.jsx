import React from "react";
import { Link } from "react-router-dom";

const ViewMatchesTop = ({
  searchTerm,
  setSearchTerm,
  selectedSeason,
  toggleSeasonFilter,
  setShowFilters,
  capitalize
}) => {

  const seasons = [
    "spring",
    "summer",
    "autumn",
    "winter"
  ];

  return (
    <div className="wardrobe-top-wrapper">

      <Link to="/buildmatches" className="wardrobe-action-link">
        <button className="wardrobe-action-button">
          Build Outfits
        </button>
      </Link>

      <div className="wardrobe-selection-area">

        <div className="wardrobe-option-row">

          {seasons.map((season) => (
            <button
              key={season}
              className={`wardrobe-option-button ${
                selectedSeason === season
                  ? "wardrobe-option-active"
                  : ""
              }`}
              onClick={() => toggleSeasonFilter(season)}
            >
              {capitalize(season)}
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
            placeholder="Search outfits..."
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

export default ViewMatchesTop;