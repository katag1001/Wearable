import React, { useEffect, useState } from "react";

import { PagedCacheContext } from "./pagedCacheContext.js";
import { createPagedCache } from "./createPagedCache.js";

/*
 * Holds one page cache per paginated list for the whole session
 * (see createPagedCache.js), and clears them all on logout so the next
 * user starts empty.
 */
export const PagedCacheProvider = ({ loggedIn, children }) => {
  const [caches] = useState(() => ({
    matches: createPagedCache({ endpoint: "/match/", listKey: "matches" }),
    clothes: createPagedCache({ endpoint: "/clothing/", listKey: "items" }),
    footwear: createPagedCache({ endpoint: "/footwear/", listKey: "items" }),
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
