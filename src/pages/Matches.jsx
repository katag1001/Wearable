import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import axios from "axios";

import Header from "../components/header";
import ViewMatches from "../components/matches/viewMatches";
import ViewMatchesTop from "../components/matches/viewMatchesTop";
import Filter from "../components/general/filter";
import Pagination from "../components/general/pagination";

import { usePagedCache } from "../context/usePagedCache";
import { usePagedList } from "../hooks/usePagedList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { buildMatchFilterQuery } from "../utils/matchQuery";
import { withPage, formatListCount } from "../utils/pageQuery";

import "../styles/pages.css";

const defaultFilters = {
  seasons: [],
  colors: [],
  styles: [],
  tags: [],
  minTemp: null,
  maxTemp: null,
  favourite: false,
  items: {
    top: null,
    bottom: null,
    outer: null,
    onepiece: null,
  },
};

const Matches = ({ loggedIn, logout }) => {
  const [searchParams] = useSearchParams();
  const itemFilter = searchParams.get("item");

  const location = useLocation();

  const {
    fetchPage,
    fetchFilterOptions,
    invalidateFilterOptions,
    getSavedView,
    saveView,
  } = usePagedCache("matches");

  // Coming from "View New Matches" (?item=) starts a fresh view;
  // otherwise pick up the search / filters / page from last time.
  const [savedView] = useState(() =>
    itemFilter ? null : getSavedView()
  );

  const [error, setError] = useState(null);

  // True only when we've just navigated here from "View New Matches"
  // and the newly created item's matches may still be generating
  // on the server (match creation is fire-and-forget).
  const [waitingForNewMatch, setWaitingForNewMatch] = useState(
    Boolean(location.state?.processing && itemFilter)
  );

  const [editingMatch, setEditingMatch] =
    useState(null);

  const [selectedSeason, setSelectedSeason] =
    useState(savedView?.selectedSeason ?? null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState(savedView?.searchTerm ?? "");

  const [filters, setFilters] = useState(
    savedView?.filters ?? defaultFilters
  );

  const [filterOptions, setFilterOptions] =
    useState(null);

  /* -------------------- Query -------------------- */

  const debouncedSearch = useDebouncedValue(searchTerm);

  const filterQuery = buildMatchFilterQuery({
    search: debouncedSearch,
    season: selectedSeason,
    filters,
    item: itemFilter,
  });

  // The page number belongs to the filters it was chosen under, so any
  // change to search / season / filters goes back to page 1 without a
  // wasted request for the old page number.
  const [pageState, setPageState] = useState(
    savedView?.pageState ?? { filterQuery, page: 1 }
  );

  const page =
    pageState.filterQuery === filterQuery ? pageState.page : 1;

  const query = withPage(filterQuery, page);

  const {
    data,
    loading,
    error: pageError,
    reload,
    updateItem,
  } = usePagedList("matches", query, {
    enabled: !waitingForNewMatch,
    errorMessage: "Failed to fetch matches",
  });

  useEffect(() => {
    if (itemFilter) return;

    saveView({ searchTerm, selectedSeason, filters, pageState });
  }, [itemFilter, searchTerm, selectedSeason, filters, pageState, saveView]);

  /* -------------------- Filter panel options -------------------- */

  const loadFilterOptions = () => {
    fetchFilterOptions()
      .then(setFilterOptions)
      .catch((err) => {
        // The panel falls back to showing every option.
        console.error("Failed to load filter options:", err);
      });
  };

  useEffect(() => {
    loadFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- New matches polling -------------------- */

  useEffect(() => {
    if (!waitingForNewMatch) return undefined;

    let attempts = 0;
    const maxAttempts = 8;
    let timeoutId;
    const controller = new AbortController();

    const poll = async () => {
      attempts += 1;

      try {
        setError(null);

        // Cached by the store, so the page shows it as soon as
        // polling stops.
        const result = await fetchPage(query, {
          signal: controller.signal,
        });

        if (result.filteredTotal > 0 || attempts >= maxAttempts) {
          // New outfits mean new colours / tags / items to filter by.
          invalidateFilterOptions();
          loadFilterOptions();
          setWaitingForNewMatch(false);
          return;
        }

        timeoutId = setTimeout(poll, 1000);
      } catch (err) {
        if (axios.isCancel(err)) return;

        setError(
          err.message === "No user logged in"
            ? err.message
            : "Failed to fetch matches"
        );
        setWaitingForNewMatch(false);
      }
    };

    poll();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Actions -------------------- */

  // After a delete or edit: the page, the counts and the filter
  // options can all have changed.
  const refresh = () => {
    invalidateFilterOptions();
    loadFilterOptions();
    reload();
  };

  const handleError = (msg) => {
    setError(msg);
  };

  const handleFavouriteToggle = (matchId, favourite) => {
    updateItem(matchId, { favourite });

    // An unfavourited outfit no longer belongs in a favourites-only list.
    if (filters.favourite) {
      reload();
    }
  };

  const handlePageChange = (newPage) => {
    setPageState({ filterQuery, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSeasonFilter = (season) => {
    setSelectedSeason((prev) =>
      prev === season ? null : season
    );
  };

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() +
    word.slice(1);

  const count = formatListCount(data);

  return (
    <div className="full-page-container">
      <Header
        loggedIn={loggedIn}
      />

      <div className="main-container">
      <h2 className="page-title">
        My Outfits
        {count && (
          <>
            {" "}
            <span className="page-title-count">
              ({count})
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
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSeason={selectedSeason}
        toggleSeasonFilter={
          toggleSeasonFilter
        }
        setShowFilters={setShowFilters}
        capitalize={capitalize}
      />

      {(error || pageError) && (
        <p className="error-text">
          {error || pageError}
        </p>
      )}


      <div className="page-bottom-container">
        {waitingForNewMatch ? (
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
              onEdit={setEditingMatch}
              refresh={refresh}
              setError={setError}
              onFavouriteToggle={handleFavouriteToggle}
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
        filters={filters}
        setFilters={setFilters}
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
