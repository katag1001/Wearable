import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { deleteMatches as deleteMatchesRequest } from "../api/matches.js";
import { getErrorMessage } from "../api/errors.js";
import { usePagedCache } from "../cache/usePagedCache.js";
import { defaultFilters } from "../filters/filterDefaults.js";
import { buildMatchFilterQuery } from "../utils/matchQuery.js";
import { formatListCount, withPage } from "../utils/pageQuery.js";
import { useDebouncedValue } from "./useDebouncedValue.js";
import { usePagedList } from "./usePagedList.js";

// After adding a clothing item its outfits are made in the background on
// the server, so "View new matches" checks once a second for a while.
const POLL_INTERVAL_MS = 1000;
const POLL_ATTEMPTS = 8;

/*
 * The outfits list: search, season buttons, the filter panel and the page,
 * remembered for the session.
 *
 * `itemFilter` (an item id) shows only outfits with that item - "View new
 * matches" after adding clothes. That view starts fresh rather than from
 * the remembered one, and with `waitForNewMatches` polls until the new
 * outfits appear.
 */
export const useMatchesPage = ({ itemFilter = null, waitForNewMatches = false } = {}) => {
  const {
    fetchPage,
    fetchFilterOptions,
    invalidateFilterOptions,
    getSavedView,
    saveView,
  } = usePagedCache("matches");

  const [savedView] = useState(() => (itemFilter ? null : getSavedView()));

  const [actionError, setActionError] = useState(null);

  const [waitingForNewMatch, setWaitingForNewMatch] = useState(
    Boolean(waitForNewMatches && itemFilter)
  );

  const [selectedSeason, setSelectedSeason] = useState(
    savedView?.selectedSeason ?? null
  );
  const [searchTerm, setSearchTerm] = useState(savedView?.searchTerm ?? "");
  const [filters, setFilters] = useState(savedView?.filters ?? defaultFilters);
  const [filterOptions, setFilterOptions] = useState(null);

  /* -------------------- Query -------------------- */

  const debouncedSearch = useDebouncedValue(searchTerm);

  const filterQuery = buildMatchFilterQuery({
    search: debouncedSearch,
    season: selectedSeason,
    filters,
    item: itemFilter,
  });

  // The page number belongs to the filters it was chosen under, so any
  // change to search / season / filters goes back to page 1.
  const [pageState, setPageState] = useState(
    savedView?.pageState ?? { filterQuery, page: 1 }
  );

  const page = pageState.filterQuery === filterQuery ? pageState.page : 1;
  const query = withPage(filterQuery, page);

  const {
    data,
    dataQuery,
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

  const setPage = (newPage) => {
    setPageState({ filterQuery, page: newPage });
  };

  /* -------------------- Filter panel options -------------------- */

  const loadFilterOptions = useCallback(() => {
    fetchFilterOptions()
      .then(setFilterOptions)
      .catch((err) => {
        // The panel falls back to showing every option.
        console.error("Failed to load filter options:", err);
      });
  }, [fetchFilterOptions]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  /* -------------------- New matches polling -------------------- */

  useEffect(() => {
    if (!waitingForNewMatch) return undefined;

    let attempts = 0;
    let timeoutId;
    const controller = new AbortController();

    const poll = async () => {
      attempts += 1;

      try {
        setActionError(null);

        // Cached, so the list shows it as soon as polling stops.
        const result = await fetchPage(query, { signal: controller.signal });

        if (result.filteredTotal > 0 || attempts >= POLL_ATTEMPTS) {
          // New outfits mean new colours / tags / items to filter by.
          invalidateFilterOptions();
          loadFilterOptions();
          setWaitingForNewMatch(false);
          return;
        }

        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (axios.isCancel(err)) return;

        setActionError(
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
    // Runs once, for the view this page opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Actions -------------------- */

  // After a delete or edit: the page, the counts and the filter options
  // can all have changed.
  const refresh = () => {
    invalidateFilterOptions();
    loadFilterOptions();
    reload();
  };

  const toggleSeason = (season) => {
    setSelectedSeason((prev) => (prev === season ? null : season));
  };

  const onFavouriteToggle = (matchId, favourite) => {
    updateItem(matchId, { favourite });

    // An unfavourited outfit no longer belongs in a favourites-only list.
    if (filters.favourite) {
      reload();
    }
  };

  // Resolves to true when deleted (and the list refreshed).
  const deleteMatches = async (ids) => {
    setActionError(null);

    try {
      await deleteMatchesRequest(ids);
      refresh();
      return true;
    } catch (err) {
      console.error("Delete error:", err);
      setActionError(
        getErrorMessage(
          err,
          ids.length === 1 ? "Failed to delete match" : "Failed to delete matches"
        )
      );
      return false;
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedSeason,
    toggleSeason,
    filters,
    setFilters,
    filterOptions,

    filterQuery,
    data,
    dataQuery,
    loading,
    waitingForNewMatch,
    error: actionError || pageError,
    setError: setActionError,
    count: formatListCount(data),
    page,
    setPage,

    refresh,
    onFavouriteToggle,
    deleteMatches,
  };
};
