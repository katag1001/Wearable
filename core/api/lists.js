// core/api/lists.js
//
// The paginated lists (outfits, clothes, footwear) share one shape:
// `${endpoint}?${query}` for a page, `${endpoint}options` for the filter
// panel's choices. Used by core/cache/createPagedCache.js.

import { api } from "./client.js";

// { [listKey], page, totalPages, filteredTotal, total }
export const fetchListPage = async (endpoint, query, { signal } = {}) => {
  const response = await api.get(`${endpoint}?${query}`, { signal });

  return response.data;
};

export const fetchListOptions = async (endpoint) => {
  const response = await api.get(`${endpoint}options`);

  return response.data;
};
