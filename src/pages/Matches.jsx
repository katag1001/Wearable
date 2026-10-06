import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";

import Header from "../components/header";
import ViewMatches from "../components/matches/viewMatches";
import ViewMatchesTop from "../components/matches/viewMatchesTop";
import Filter from "../components/general/filter";

import { useMatches } from "../context/useMatches";

import "../styles/pages.css";

const Matches = ({ loggedIn, logout }) => {
  const [searchParams] = useSearchParams();
  const itemFilter = searchParams.get("item");

  const location = useLocation();

  const {
    matches,
    setMatches,
    fetchMatches: fetchSharedMatches,
  } = useMatches();
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
    useState(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filters, setFilters] = useState({
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
  });

  // Re-fetches into the shared store. The cached list stays on screen
  // until the fresh one arrives, so revisiting the page is instant.
  const fetchMatches = async () => {
    try {
      setError(null);
      await fetchSharedMatches();
    } catch (err) {
      setError(
        err.message === "No user logged in"
          ? err.message
          : "Failed to fetch matches"
      );
    }
  };

  useEffect(() => {
    if (!waitingForNewMatch) {
      fetchMatches();
      return;
    }

    let attempts = 0;
    const maxAttempts = 8;
    let timeoutId;
    let cancelled = false;

    const poll = async () => {
      attempts += 1;

      try {
        setError(null);

        const data = await fetchSharedMatches();

        if (cancelled) return;

        const found = data.some((match) =>
          match.clothes?.some(
            (item) => item._id === itemFilter
          )
        );

        if (found || attempts >= maxAttempts) {
          setWaitingForNewMatch(false);
          return;
        }

        timeoutId = setTimeout(poll, 1000);
      } catch (err) {
        if (cancelled) return;

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
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateSuccess = (updatedMatch) => {
    setMatches((prev) =>
      prev.map((match) =>
        match._id === updatedMatch._id
          ? updatedMatch
          : match
      )
    );
  };

  const handleError = (msg) => {
    setError(msg);
  };

  const handleFavouriteToggle = (matchId, favourite) => {
    setMatches((prev) =>
      prev.map((match) =>
        match._id === matchId
          ? { ...match, favourite }
          : match
      )
    );
  };

  const toggleSeasonFilter = (season) => {
    setSelectedSeason((prev) =>
      prev === season ? null : season
    );
  };

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() +
    word.slice(1);

  const filteredMatches = matches.filter(
    (match) => {
      if (
        itemFilter &&
        !match.clothes?.some(
          (item) =>
            item._id === itemFilter
        )
      ) {
        return false;
      }

      if (
        selectedSeason &&
        !match[selectedSeason]
      ) {
        return false;
      }

      if (searchTerm.trim()) {
        const search =
          searchTerm.toLowerCase();

        const matchesSearch =
          match.clothes?.some((item) =>
            item.name
              ?.toLowerCase()
              .includes(search)
          ) ||
          match.colors?.some((color) =>
            color
              .toLowerCase()
              .includes(search)
          ) ||
          match.styles?.some((style) =>
            style
              .toLowerCase()
              .includes(search)
          ) ||
          match.tags?.some((tag) =>
            tag
              .toLowerCase()
              .includes(search)
          );

        if (!matchesSearch) {
          return false;
        }
      }

      if (filters.favourite && !match.favourite) {
        return false;
      }

      if (filters.seasons.length > 0) {
        if (
          !filters.seasons.some(
            (season) =>
              match[season]
          )
        ) {
          return false;
        }
      }

      if (filters.colors.length > 0) {
        if (
          !match.colors?.some((color) =>
            filters.colors.includes(color)
          )
        ) {
          return false;
        }
      }

      if (filters.styles.length > 0) {
        if (
          !match.styles?.some((style) =>
            filters.styles.includes(style)
          )
        ) {
          return false;
        }
      }

      if (filters.tags.length > 0) {
        if (
          !(match.tags || []).some((tag) =>
            filters.tags.includes(tag)
          )
        ) {
          return false;
        }
      }

      const selectedItemIds = Object.values(
        filters.items || {}
      ).filter(Boolean);

      if (selectedItemIds.length > 0) {
        const matchClothesIds = (match.clothes || []).map(
          (item) => item._id
        );

        const hasAllSelectedItems = selectedItemIds.every(
          (id) => matchClothesIds.includes(id)
        );

        if (!hasAllSelectedItems) {
          return false;
        }
      }

      if (
        filters.minTemp !== null &&
        match.max_temp < filters.minTemp
      ) {
        return false;
      }

      if (
        filters.maxTemp !== null &&
        match.min_temp > filters.maxTemp
      ) {
        return false;
      }

      return true;
    }
  );

  const clothesByCategory = { top: [], bottom: [], outer: [], onepiece: [] };

  const seenClothesIds = new Set();

  matches.forEach((match) => {
    (match.clothes || []).forEach((item) => {
      if (
        item?._id &&
        clothesByCategory[item.type] &&
        !seenClothesIds.has(item._id)
      ) {
        seenClothesIds.add(item._id);
        clothesByCategory[item.type].push(item);
      }
    });
  });

  return (
    <div className="full-page-container">
      <Header
        loggedIn={loggedIn}
      />

      <div className="main-container">
      <h2 className="page-title">
        My Outfits{" "}
        <span className="page-title-count">
          ({filteredMatches.length})
        </span>
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

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

    
      <div className="page-bottom-container">
        {waitingForNewMatch ? (
          <p className="no-items-text">
            Finding your new matches...
          </p>
        ) : (
          <ViewMatches
            matches={filteredMatches}
            onEdit={setEditingMatch}
            refresh={fetchMatches}
            setError={setError}
            onFavouriteToggle={handleFavouriteToggle}
          />
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
        clothesByCategory={clothesByCategory}
        availableColors={[
          ...new Set(
            matches.flatMap(
              (match) =>
                match.colors || []
            )
          ),
        ]}
        availableStyles={[
          ...new Set(
            matches.flatMap(
              (match) =>
                match.styles || []
            )
          ),
        ]}
        availableTags={[
          ...new Set(
            matches.flatMap(
              (match) =>
                match.tags || []
            )
          ),
        ]}
      />

    </div>
    </div>
  );
};

export default Matches;
