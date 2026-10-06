const {
  SEASONS,
  parseList,
  parseNumber,
  parsePaging,
  parseSeasons,
  parseSearch,
  isValidId,
  searchRegex,
  anySeasonCondition,
  anyOfCondition,
  combineConditions,
} = require("./queryHelpers.js");

/*
 * Turns the My Outfits page's search / filters / page number (sent as
 * query-string parameters on GET /match/) into a MongoDB query.
 *
 * Kept separate from the controller so each filter rule can be found and
 * changed on its own, and so the rules can be unit tested without a DB.
 * Paging and the rules shared with clothing live in queryHelpers.js.
 */

// Only what the outfit cards and filter panel use - the full clothing
// documents are much larger and are repeated in every outfit they appear in.
const CLOTHES_CARD_FIELDS = "name imageUrl type";

/* -------------------- Parsing -------------------- */

const parseMatchQuery = (query = {}) => {
  // An invalid ?item= id can never match an outfit - remembered so the
  // query returns nothing instead of silently ignoring the filter.
  const item = query.item ? String(query.item) : null;

  return {
    ...parsePaging(query),
    search: parseSearch(query.search),
    season: SEASONS.includes(query.season) ? query.season : null,
    seasons: parseSeasons(query.seasons),
    colors: parseList(query.colors),
    styles: parseList(query.styles),
    tags: parseList(query.tags),
    items: parseList(query.items).filter(isValidId),
    item,
    itemIsValid: item ? isValidId(item) : true,
    favourite: query.favourite === "true",
    minTemp: parseNumber(query.minTemp),
    maxTemp: parseNumber(query.maxTemp),
  };
};

/* -------------------- Search -------------------- */

// Outfit search also matches the names of the clothes inside each outfit.
// Those names live on Clothes, so the matching item ids are found first
// (see findClothesIdsMatchingSearch) and passed in here.
const buildSearchCondition = (search, matchingClothesIds = []) => {
  const regex = searchRegex(search);

  return {
    $or: [
      { clothes: { $in: matchingClothesIds } },
      { colors: regex },
      { styles: regex },
      { tags: regex },
    ],
  };
};

const findClothesIdsMatchingSearch = async (Clothes, userId, search) => {
  if (!search) return [];

  return Clothes.find({ userId, name: searchRegex(search) }).distinct("_id");
};

/* -------------------- Filter rules -------------------- */

// Each rule returns a condition, or null when that filter isn't in use.

const seasonButtonCondition = ({ season }) =>
  season ? { [season]: true } : null;

const seasonsCondition = ({ seasons }) => anySeasonCondition(seasons);

const colorsCondition = ({ colors }) => anyOfCondition("colors", colors);

const stylesCondition = ({ styles }) => anyOfCondition("styles", styles);

const tagsCondition = ({ tags }) => anyOfCondition("tags", tags);

const favouriteCondition = ({ favourite }) =>
  favourite ? { favourite: true } : null;

// The filter panel's "items" are "must contain all of".
const itemsCondition = ({ items }) =>
  items.length > 0 ? { clothes: { $all: items } } : null;

// ?item= comes from "View New Matches" after adding a clothing item.
const singleItemCondition = ({ item, itemIsValid }) => {
  if (!item) return null;

  // Matches no document, so the result is empty rather than unfiltered.
  if (!itemIsValid) return { _id: null };

  return { clothes: item };
};

// An outfit is kept when its temperature range overlaps the chosen one.
const temperatureCondition = ({ minTemp, maxTemp }) => {
  const condition = {};

  if (minTemp !== null) condition.max_temp = { $gte: minTemp };
  if (maxTemp !== null) condition.min_temp = { $lte: maxTemp };

  return Object.keys(condition).length > 0 ? condition : null;
};

const FILTER_RULES = [
  seasonButtonCondition,
  seasonsCondition,
  colorsCondition,
  stylesCondition,
  tagsCondition,
  favouriteCondition,
  itemsCondition,
  singleItemCondition,
  temperatureCondition,
];

const buildMatchFilter = (userId, filters, matchingClothesIds = []) =>
  combineConditions(userId, [
    ...FILTER_RULES.map((rule) => rule(filters)),
    filters.search
      ? buildSearchCondition(filters.search, matchingClothesIds)
      : null,
  ]);

/* -------------------- Filter panel options -------------------- */

const groupClothesByType = (clothes) => {
  const grouped = { top: [], bottom: [], outer: [], onepiece: [] };

  clothes.forEach((item) => {
    if (grouped[item.type]) {
      grouped[item.type].push(item);
    }
  });

  return grouped;
};

module.exports = {
  CLOTHES_CARD_FIELDS,
  parseMatchQuery,
  buildMatchFilter,
  findClothesIdsMatchingSearch,
  groupClothesByType,
};
