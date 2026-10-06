import { PAGE_SIZE, addList } from "./pageQuery";

/*
 * Builds the query string for GET /clothing/ from the My Clothes page's
 * search, type button and filter panel (the page number is added with
 * withPage from ./pageQuery).
 *
 * The server reads these in server/services/clothingQueryService.js -
 * keep the parameter names in step with parseClothingQuery there.
 */

// Everything except the page number. Used both to build the request and
// to tell when the filters changed (so the page should go back to 1).
export const buildClothingFilterQuery = ({
  search = "",
  type = null,
  filters = {},
  limit = PAGE_SIZE,
}) => {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  if (search.trim()) params.set("search", search.trim());
  if (type) params.set("type", type);

  addList(params, "seasons", filters.seasons);
  addList(params, "colors", filters.colors);
  addList(params, "styles", filters.styles);

  return params.toString();
};
