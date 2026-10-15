import { useEffect, useState } from "react";

import { withPage } from "../utils/pageQuery.js";

/*
 * Infinite scroll on top of a page-at-a-time list (useWardrobePage /
 * useMatchesPage): keeps every page loaded so far for the current filters
 * and joins them into one list. The web shows page numbers instead.
 *
 * - `loadMore` asks for the next page (call it near the end of the list).
 * - When page 1 arrives (first load, new filters, or a refresh), the
 *   list starts again from it, so deletes and edits never leave stale
 *   later pages behind.
 * - A page is only taken when it belongs to the current filters
 *   (`dataQuery`), never the previous list still showing while they load.
 */
export const useAccumulatedPages = ({
  data,
  dataQuery,
  filterQuery,
  listKey,
  page,
  setPage,
  loading,
}) => {
  // { filterQuery, byPage: { [page]: items } }
  const [loaded, setLoaded] = useState({ filterQuery: null, byPage: {} });

  // Always start from the first page (the web may have left the shared
  // saved view on a later one).
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data || dataQuery !== withPage(filterQuery, data.page)) return;

    setLoaded((prev) => {
      const keepEarlier = prev.filterQuery === filterQuery && data.page > 1;

      return {
        filterQuery,
        byPage: {
          ...(keepEarlier ? prev.byPage : {}),
          [data.page]: data[listKey],
        },
      };
    });
  }, [data, dataQuery, filterQuery, listKey]);

  const byPage = loaded.filterQuery === filterQuery ? loaded.byPage : {};

  const items = Object.keys(byPage)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((pageNumber) => byPage[pageNumber]);

  const lastPage = Math.max(0, ...Object.keys(byPage).map(Number));
  const hasMore = !!data && lastPage < data.totalPages;

  const loadMore = () => {
    if (hasMore && !loading && page === lastPage) {
      setPage(lastPage + 1);
    }
  };

  // Back to the first page (pull to refresh) - call the list's refresh too.
  const restart = () => setPage(1);

  return {
    items,
    hasMore,
    loadMore,
    restart,
    // Nothing for these filters yet (show a spinner, not "no items").
    isFirstLoad: loaded.filterQuery !== filterQuery,
  };
};
