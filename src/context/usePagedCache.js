import { useContext } from "react";

import { PagedCacheContext } from "./pagedCacheContext";

// name: "matches" or "clothes" (see PagedCacheProvider.jsx)
export const usePagedCache = (name) => {
  const caches = useContext(PagedCacheContext);

  if (!caches) {
    throw new Error("usePagedCache must be used inside a PagedCacheProvider");
  }

  return caches[name];
};
