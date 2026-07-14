import React from "react";
import { Link } from 'react-router-dom';

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
    <>

          <div className="sticky-upload-container">
        <Link to="/buildmatches">
          <button className="top-button">Build Outfits</button>
        </Link>
      </div>

      <div className="search-container">

        <input
          type="text"
          placeholder="Search outfits..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="search-bar"
        />

      </div>

      <div className="season-filters">

        {seasons.map((season) => (

          <button
            key={season}

            className={`text-button ${
              selectedSeason === season
                ? "active"
                : ""
            }`}

            onClick={() =>
              toggleSeasonFilter(season)
            }

          >

            {capitalize(season)}

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

export default ViewMatchesTop;