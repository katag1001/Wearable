import React, { useEffect, useState } from "react";

import { PagedCacheContext } from "./pagedCacheContext";
import { createPagedCache } from "./createPagedCache";

/*
 * Holds one page cache per paginated list for the whole session
 * (see createPagedCache.js), and clears them all on logout so the next
 * user starts empty.
 */
export const PagedCacheProvider = ({ loggedIn, children }) => {
  const [caches] = useState(() => ({
    matches: createPagedCache({ endpoint: "/match/", listKey: "matches" }),
    clothes: createPagedCache({ endpoint: "/clothing/", listKey: "items" }),
  }));

  useEffect(() => {
    if (!loggedIn) {
      Object.values(caches).forEach((cache) => cache.clear());
    }
  }, [loggedIn, caches]);

  return (
    <PagedCacheContext.Provider value={caches}>
      {children}
    </PagedCacheContext.Provider>
  );
};
