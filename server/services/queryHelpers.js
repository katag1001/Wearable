const mongoose = require("mongoose");

/*
 * Shared pieces for the paginated list endpoints (GET /match/ and
 * GET /clothing/). Each list keeps its own filter rules in its own
 * service - matchQueryService.js and clothingQueryService.js.
 */

const DEFAULT_PAGE_SIZE = 32;
const MAX_PAGE_SIZE = 100;

const SEASONS = ["spring", "summer", "autumn", "winter"];

// Newest first. _id is used rather than a date field because every
// document has one, it is always indexed, and it never ties (so pages
// never overlap).
const NEWEST_FIRST = { _id: -1 };

/* -------------------- Parsing -------------------- */

// Lists arrive comma-separated: ?colors=blue,red
const parseList = (value) => {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const parsePositiveInt = (value, fallback) => {
  const number = parseInt(value, 10);

  return Number.isInteger(number) && number > 0 ? number : fallback;
};

const parsePaging = (query = {}) => ({
  page: parsePositiveInt(query.page, 1),
  limit: Math.min(
    parsePositiveInt(query.limit, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  ),
});

const parseSeasons = (value) =>
  parseList(value).filter((season) => SEASONS.includes(season));

const parseSearch = (value) => (value ? String(value).trim() : "");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* -------------------- Search -------------------- */

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Case-insensitive "contains", the same as the old in-browser search.
const searchRegex = (search) => new RegExp(escapeRegex(search), "i");

/* -------------------- Shared filter rules -------------------- */

// The filter panel's seasons are "any of".
const anySeasonCondition = (seasons) =>
  seasons.length > 0
    ? { $or: seasons.map((season) => ({ [season]: true })) }
    : null;

// "Has at least one of these values" on a list field (colours, styles...).
const anyOfCondition = (field, values) =>
  values.length > 0 ? { [field]: { $in: values } } : null;

// Runs each rule (returns a condition, or null when that filter isn't in
// use) and joins the conditions onto the user's own documents.
const combineConditions = (userId, conditions) => {
  const active = conditions.filter(Boolean);

  return active.length > 0
    ? { userId, $and: active }
    : { userId };
};

/* -------------------- Paging -------------------- */

// Keeps the requested page inside the results, e.g. after deleting the
// last document on the last page.
const resolvePage = (requestedPage, limit, filteredTotal) => {
  const totalPages = Math.max(1, Math.ceil(filteredTotal / limit));

  return {
    page: Math.min(requestedPage, totalPages),
    totalPages,
  };
};

// Counts, clamps the page and fetches it. `listKey` names the array in
// the response ("matches" / "items"); `prepare` adds populate etc.
const findPage = async ({
  Model,
  userId,
  filter,
  paging,
  listKey,
  prepare = (query) => query,
}) => {
  const [filteredTotal, total] = await Promise.all([
    Model.countDocuments(filter),
    Model.countDocuments({ userId }),
  ]);

  const { page, totalPages } = resolvePage(
    paging.page,
    paging.limit,
    filteredTotal
  );

  const list = await prepare(
    Model.find(filter)
      .sort(NEWEST_FIRST)
      .skip((page - 1) * paging.limit)
      .limit(paging.limit)
  ).lean();

  return {
    [listKey]: list,
    page,
    totalPages,
    limit: paging.limit,
    filteredTotal,
    total,
  };
};

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  SEASONS,
  NEWEST_FIRST,
  parseList,
  parseNumber,
  parsePositiveInt,
  parsePaging,
  parseSeasons,
  parseSearch,
  isValidId,
  escapeRegex,
  searchRegex,
  anySeasonCondition,
  anyOfCondition,
  combineConditions,
  resolvePage,
  findPage,
};
