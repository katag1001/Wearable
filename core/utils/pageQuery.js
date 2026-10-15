/*
 * Shared helpers for the paginated list query strings
 * (utils/matchQuery.js and utils/clothingQuery.js).
 *
 * The server reads these in server/services/queryHelpers.js.
 */

export const PAGE_SIZE = 32;

// Lists are sent comma-separated: colors=blue,red
export const addList = (params, key, values) => {
  if (values?.length > 0) {
    params.set(key, values.join(","));
  }
};

export const withPage = (filterQuery, page) =>
  `${filterQuery}&page=${page}`;

// "3,412 of 9,870" while filtered, just "9,870" when showing everything.
export const formatListCount = (data) => {
  if (!data) return null;

  const total = data.total.toLocaleString();

  return data.filteredTotal === data.total
    ? total
    : `${data.filteredTotal.toLocaleString()} of ${total}`;
};
