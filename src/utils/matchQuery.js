import { PAGE_SIZE, addList } from "./pageQuery";

/*
 * Builds the query string for GET /match/ from the My Outfits page's
 * search, season button and filter panel (the page number is added
 * with withPage from ./pageQuery).
 *
 * The server reads these in server/services/matchQueryService.js -
 * keep the parameter names in step with parseMatchQuery there.
 */

// Everything except the page number. Used both to build the request and
// to tell when the filters changed (so the page should go back to 1).
export const buildMatchFilterQuery = ({
  search = "",
  season = null,
  filters = {},
  item = null,
  limit = PAGE_SIZE,
}) => {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  if (search.trim()) params.set("search", search.trim());
  if (season) params.set("season", season);
  if (item) params.set("item", item);

  addList(params, "seasons", filters.seasons);
  addList(params, "colors", filters.colors);
  addList(params, "styles", filters.styles);
  addList(params, "tags", filters.tags);
  addList(
    params,
    "items",
    Object.values(filters.items || {}).filter(Boolean)
  );

  if (filters.favourite) params.set("favourite", "true");
  if (filters.minTemp !== null && filters.minTemp !== undefined) {
    params.set("minTemp", String(filters.minTemp));
  }
  if (filters.maxTemp !== null && filters.maxTemp !== undefined) {
    params.set("maxTemp", String(filters.maxTemp));
  }

  return params.toString();
};
