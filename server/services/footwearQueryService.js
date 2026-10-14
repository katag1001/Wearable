const {
  parseList,
  parsePaging,
  parseSeasons,
  parseSearch,
  searchRegex,
  anySeasonCondition,
  anyOfCondition,
  combineConditions,
} = require("./queryHelpers.js");

/*
 * Turns the Footwear tab's search / filters / page number (sent as
 * query-string parameters on GET /footwear/) into a MongoDB query.
 * Footwear has no role (`type`), so unlike clothingQueryService.js there
 * is no type filter - just subtypes. Paging and the shared rules live in
 * queryHelpers.js.
 */

/* -------------------- Parsing -------------------- */

const parseFootwearQuery = (query = {}) => ({
  ...parsePaging(query),
  search: parseSearch(query.search),
  seasons: parseSeasons(query.seasons),
  colors: parseList(query.colors),
  styles: parseList(query.styles),
  tags: parseList(query.tags),
  subtypes: parseList(query.subtypes),
});

/* -------------------- Filter rules -------------------- */

// Each rule returns a condition, or null when that filter isn't in use.

const seasonsCondition = ({ seasons }) => anySeasonCondition(seasons);

const colorsCondition = ({ colors }) => anyOfCondition("colors", colors);

const stylesCondition = ({ styles }) => anyOfCondition("styles", styles);

const tagsCondition = ({ tags }) => anyOfCondition("tags", tags);

const subtypesCondition = ({ subtypes }) =>
  anyOfCondition("subtype", subtypes);

// Name, any colour or any style contains the search text.
const searchCondition = ({ search }) => {
  if (!search) return null;

  const regex = searchRegex(search);

  return {
    $or: [
      { name: regex },
      { colors: regex },
      { styles: regex },
    ],
  };
};

const FILTER_RULES = [
  seasonsCondition,
  colorsCondition,
  stylesCondition,
  tagsCondition,
  subtypesCondition,
  searchCondition,
];

const buildFootwearFilter = (userId, filters) =>
  combineConditions(
    userId,
    FILTER_RULES.map((rule) => rule(filters))
  );

/* -------------------- Filter panel options -------------------- */

// The subtypes the user owns, A-Z, e.g. ["Ankle boots", "Casual trainers"].
const listOwnedSubtypes = (subtypes) =>
  [...new Set(subtypes.filter(Boolean))].sort((a, b) => a.localeCompare(b));

module.exports = {
  parseFootwearQuery,
  buildFootwearFilter,
  listOwnedSubtypes,
};
