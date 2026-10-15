import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { usePagedCache } from "../cache/usePagedCache.js";

/*
 * Loads one page of a paginated list ("matches" or "clothes") for a
 * query string.
 *
 * A page already in the session cache is shown straight away, and then
 * re-fetched in the background so it stays up to date. Changing the
 * query (new page / filters) cancels the request for the old one, so a
 * slow old response can never replace a newer one.
 *
 * While a new query loads, the previous page stays on show; `dataQuery`
 * says which query `data` is for.
 */
export const usePagedList = (
  cacheName,
  query,
  { enabled = true, errorMessage = "Failed to load" } = {}
) => {
  const cache = usePagedCache(cacheName);
  const { listKey } = cache;

  const [data, setData] = useState(
    () => cache.getCachedPage(query) ?? null
  );
  const [dataQuery, setDataQuery] = useState(() =>
    cache.getCachedPage(query) ? query : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const cached = cache.getCachedPage(query);

    if (cached) {
      setData(cached);
      setDataQuery(query);
    }

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    cache
      .fetchPage(query, { signal: controller.signal })
      .then((fresh) => {
        setData(fresh);
        setDataQuery(query);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;

        setError(
          err.message === "No user logged in" ? err.message : errorMessage
        );
        setLoading(false);
      });

    return () => controller.abort();
  }, [cache, query, enabled, reloadKey, errorMessage]);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  // Applies a change made on a card (e.g. favourite) without a re-fetch.
  const updateItem = useCallback(
    (id, changes) => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              [listKey]: prev[listKey].map((entry) =>
                entry._id === id ? { ...entry, ...changes } : entry
              ),
            }
          : prev
      );

      cache.updateCachedItem(id, changes);
    },
    [cache, listKey]
  );

  return { data, dataQuery, loading, error, reload, updateItem };
};
