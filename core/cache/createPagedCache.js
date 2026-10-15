import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { fetchListOptions, fetchListPage } from "../api/lists.js";

/*
 * Session-long memory for one paginated list (outfits or clothes).
 *
 * - Pages are cached by their query string, so going back to a page
 *   you've already seen shows it instantly. Pages still re-fetch in the
 *   background when shown (see core/hooks/usePagedList.js), so changes made
 *   elsewhere appear without every one of those places updating this.
 * - The filter panel's options are fetched once and reused.
 * - The list page's search / filters / page are remembered, so leaving
 *   and coming back puts you where you were.
 *
 * `endpoint` is the list URL ("/match/"); its filter options are at
 * `${endpoint}options`. `listKey` names the array in each page
 * response ("matches" / "items").
 */

// Enough to cover flicking back and forth between recent pages/filters.
const MAX_CACHED_PAGES = 20;

// The list pages show this message as is (core/hooks/usePagedList.js).
const requireLogin = () => {
  if (!getStorage().getItem(STORAGE_KEYS.token)) {
    throw new Error("No user logged in");
  }
};

export const createPagedCache = ({ endpoint, listKey }) => {
  // query string -> { [listKey], page, totalPages, filteredTotal, total }
  let pages = new Map();
  let optionsRequest = null;
  let savedView = null;

  // Bumped on clear() so a request that started for the previous user
  // can't write their data into the cache afterwards.
  let session = 0;

  const cachePage = (query, data) => {
    // Re-inserting moves the entry to the newest end of the Map.
    pages.delete(query);
    pages.set(query, data);

    if (pages.size > MAX_CACHED_PAGES) {
      pages.delete(pages.keys().next().value);
    }
  };

  return {
    listKey,

    /* -------------------- Pages -------------------- */

    getCachedPage: (query) => pages.get(query),

    // Throws on failure (and on abort) so each page can handle it.
    fetchPage: async (query, { signal } = {}) => {
      const startedIn = session;

      requireLogin();

      const data = await fetchListPage(endpoint, query, { signal });

      if (startedIn === session) {
        cachePage(query, data);
      }

      return data;
    },

    // Keeps cached pages in step with a change made on a card (e.g. a
    // favourite), so going back to them doesn't briefly show the old value.
    updateCachedItem: (id, changes) => {
      pages.forEach((data, query) => {
        const list = data[listKey];

        if (!list.some((entry) => entry._id === id)) return;

        pages.set(query, {
          ...data,
          [listKey]: list.map((entry) =>
            entry._id === id ? { ...entry, ...changes } : entry
          ),
        });
      });
    },

    /* -------------------- Filter panel options -------------------- */

    fetchFilterOptions: () => {
      if (optionsRequest) {
        return optionsRequest;
      }

      // Started inside .then so a missing token rejects instead of throwing.
      optionsRequest = Promise.resolve()
        .then(() => {
          requireLogin();

          return fetchListOptions(endpoint);
        })
        .catch((err) => {
          // Let the next call try again rather than caching the failure.
          optionsRequest = null;
          throw err;
        });

      return optionsRequest;
    },

    // Call after things are added, edited or removed - the colours,
    // styles etc. on offer may have changed.
    invalidateFilterOptions: () => {
      optionsRequest = null;
    },

    /* -------------------- List page view -------------------- */

    getSavedView: () => savedView,

    saveView: (view) => {
      savedView = view;
    },

    /* -------------------- Logout -------------------- */

    clear: () => {
      session += 1;
      pages = new Map();
      optionsRequest = null;
      savedView = null;
    },
  };
};
