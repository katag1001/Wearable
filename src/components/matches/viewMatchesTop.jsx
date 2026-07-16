import React from "react";
import { Link } from "react-router-dom";
import '../../styles/pagesTop.css'

const ViewMatchesTop = ({
  mode,
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
    <div className="top-area-wrapper">

      <Link to="/buildmatches" className="top-action-link">
        <button className="top-action-button">
          Build Outfits
        </button>
      </Link>

      <div className="top-selection-area">

        <div className="top-option-row">

          {seasons.map((season) => (
            <button
              key={season}
              className={`top-option-button ${
                selectedSeason === season
                  ? "top-option-active"
                  : ""
              }`}
              onClick={() => toggleSeasonFilter(season)}
            >
              {capitalize(season)}
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
            placeholder="Search outfits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="top-search-input"
          />

        </div>

      </div>
      
        <div className="top-wrapper-bottom">
          <Link
            to={mode === "active" ? "/oldmatches" : "/matches"}
            className="top-action-link"
          >
            <button className="side-action-button">
              {mode === "active"
                ? "View Rejected Outfits"
                : "View Current Outfits"}
            </button>
          </Link>
        </div>
  
    </div>
  );
};

export default ViewMatchesTop;