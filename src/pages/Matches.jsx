import React, { useState } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";

import Header from "../components/header";
import ViewMatches from "../components/matches/viewMatches";
import ViewMatchesTop from "../components/matches/viewMatchesTop";
import Filter from "../components/general/filter";
import Pagination from "../components/general/pagination";

import { useMatchesPage } from "@core/hooks/useMatchesPage.js";

import "../styles/pages.css";

const capitalize = (word) =>
  word.charAt(0).toUpperCase() +
  word.slice(1);

// The list logic lives in useMatchesPage (shared with the mobile app);
// this page renders it.
const Matches = ({ loggedIn }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // "View New Matches" after adding clothes lands here with ?item= and,
  // while its outfits may still be generating, state.processing.
  const outfits = useMatchesPage({
    itemFilter: searchParams.get("item"),
    waitForNewMatches: Boolean(location.state?.processing),
  });

  const { data, loading, filterOptions } = outfits;

  const [showFilters, setShowFilters] =
    useState(false);

  const handlePageChange = (newPage) => {
    outfits.setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="full-page-container">
      <Header
        loggedIn={loggedIn}
      />

      <div className="main-container">
      <h2 className="page-title">
        My Outfits
        {outfits.count && (
          <>
            {" "}
            <span className="page-title-count">
              ({outfits.count})
            </span>
          </>
        )}
      </h2>

      <Link
        to="/buildmatches"
      >
        <button className="top-action-button">
          Build Outfits
        </button>
      </Link>

      <ViewMatchesTop
        searchTerm={outfits.searchTerm}
        setSearchTerm={outfits.setSearchTerm}
        selectedSeason={outfits.selectedSeason}
        toggleSeasonFilter={outfits.toggleSeason}
        setShowFilters={setShowFilters}
        capitalize={capitalize}
      />

      {outfits.error && (
        <p className="error-text">
          {outfits.error}
        </p>
      )}


      <div className="page-bottom-container">
        {outfits.waitingForNewMatch ? (
          <p className="no-items-text">
            Finding your new matches...
          </p>
        ) : !data ? (
          loading && (
            <p className="no-items-text">
              Loading outfits...
            </p>
          )
        ) : (
          <>
            <ViewMatches
              matches={data.matches}
              refresh={outfits.refresh}
              setError={outfits.setError}
              onFavouriteToggle={outfits.onFavouriteToggle}
              onDeleteMatches={outfits.deleteMatches}
            />

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <Filter
        isOpen={showFilters}
        onClose={() =>
          setShowFilters(false)
        }
        filters={outfits.filters}
        setFilters={outfits.setFilters}
        showFavourites
        showItemFilter
        clothesByCategory={filterOptions?.clothesByCategory}
        availableColors={filterOptions?.colors}
        availableStyles={filterOptions?.styles}
        availableTags={filterOptions?.tags}
      />

    </div>
    </div>
  );
};

export default Matches;
