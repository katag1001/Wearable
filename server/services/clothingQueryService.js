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
 * Turns the My Clothes page's search / type button / filters / page
 * number (sent as query-string parameters on GET /clothing/) into a
 * MongoDB query. Paging and the rules shared with outfits live in
 * queryHelpers.js.
 */

const CLOTHING_TYPES = ["top", "outer", "bottom", "onepiece"];

/* -------------------- Parsing -------------------- */

const parseClothingQuery = (query = {}) => ({
  ...parsePaging(query),
  search: parseSearch(query.search),
  type: CLOTHING_TYPES.includes(query.type) ? query.type : null,
  seasons: parseSeasons(query.seasons),
  colors: parseList(query.colors),
  styles: parseList(query.styles),
  tags: parseList(query.tags),
  subtypes: parseList(query.subtypes),
});

/* -------------------- Filter rules -------------------- */

// Each rule returns a condition, or null when that filter isn't in use.

const typeCondition = ({ type }) => (type ? { type } : null);

const seasonsCondition = ({ seasons }) => anySeasonCondition(seasons);

const colorsCondition = ({ colors }) => anyOfCondition("colors", colors);

const stylesCondition = ({ styles }) => anyOfCondition("styles", styles);

const tagsCondition = ({ tags }) => anyOfCondition("tags", tags);

// Each item has one subtype, so this is "is one of the chosen subtypes".
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
  typeCondition,
  seasonsCondition,
  colorsCondition,
  stylesCondition,
  tagsCondition,
  subtypesCondition,
  searchCondition,
];

const buildClothingFilter = (userId, filters) =>
  combineConditions(
    userId,
    FILTER_RULES.map((rule) => rule(filters))
  );

/* -------------------- Filter panel options -------------------- */

// The subtypes the user owns, grouped by type and sorted A-Z, e.g.
// { top: ["Shirt", "T-shirt"], bottom: ["Jeans"], outer: [], onepiece: [] }
const groupSubtypesByType = (items) => {
  const grouped = Object.fromEntries(
    CLOTHING_TYPES.map((type) => [type, new Set()])
  );

  items.forEach(({ type, subtype }) => {
    if (grouped[type] && subtype) {
      grouped[type].add(subtype);
    }
  });

  return Object.fromEntries(
    CLOTHING_TYPES.map((type) => [
      type,
      [...grouped[type]].sort((a, b) => a.localeCompare(b)),
    ])
  );
};

module.exports = {
  CLOTHING_TYPES,
  parseClothingQuery,
  buildClothingFilter,
  groupSubtypesByType,
};
