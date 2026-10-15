import { PAGE_SIZE, addList } from "./pageQuery";

/*
 * Builds the query string for GET /footwear/ from the Footwear tab's
 * search and filter panel (the page number is added with withPage from
 * ./pageQuery). Footwear has no type, only subtypes.
 *
 * The server reads these in server/services/footwearQueryService.js -
 * keep the parameter names in step with parseFootwearQuery there.
 */

export const buildFootwearFilterQuery = ({
  search = "",
  filters = {},
  limit = PAGE_SIZE,
}) => {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  if (search.trim()) params.set("search", search.trim());

  addList(params, "seasons", filters.seasons);
  addList(params, "colors", filters.colors);
  addList(params, "styles", filters.styles);
  addList(params, "tags", filters.tags);
  addList(params, "subtypes", filters.subtypes);

  return params.toString();
};
