const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseMatchQuery,
  buildMatchFilter,
  groupClothesByType,
} = require("../services/matchQueryService.js");
const {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../services/queryHelpers.js");

const USER = "user-1";
const ID_A = "64b000000000000000000001";
const ID_B = "64b000000000000000000002";

test("parseMatchQuery defaults to page 1 of the default size with no filters", () => {
  const filters = parseMatchQuery({});

  assert.equal(filters.page, 1);
  assert.equal(filters.limit, DEFAULT_PAGE_SIZE);
  assert.deepEqual(buildMatchFilter(USER, filters), { userId: USER });
});

test("parseMatchQuery caps the page size and ignores bad page numbers", () => {
  const filters = parseMatchQuery({ page: "-3", limit: "5000" });

  assert.equal(filters.page, 1);
  assert.equal(filters.limit, MAX_PAGE_SIZE);
});

test("parseMatchQuery splits comma lists and drops unknown seasons and bad ids", () => {
  const filters = parseMatchQuery({
    colors: "blue, red,",
    seasons: "summer,monsoon",
    items: `${ID_A},not-an-id`,
  });

  assert.deepEqual(filters.colors, ["blue", "red"]);
  assert.deepEqual(filters.seasons, ["summer"]);
  assert.deepEqual(filters.items, [ID_A]);
});

test("buildMatchFilter combines the season button with any-of filter seasons", () => {
  const filter = buildMatchFilter(
    USER,
    parseMatchQuery({ season: "winter", seasons: "autumn,spring" })
  );

  assert.deepEqual(filter.$and, [
    { winter: true },
    { $or: [{ autumn: true }, { spring: true }] },
  ]);
});

test("buildMatchFilter requires every selected item but any listed colour/style/tag", () => {
  const filter = buildMatchFilter(
    USER,
    parseMatchQuery({
      items: `${ID_A},${ID_B}`,
      colors: "blue",
      styles: "casual",
      tags: "work",
      favourite: "true",
    })
  );

  assert.deepEqual(filter.$and, [
    { colors: { $in: ["blue"] } },
    { styles: { $in: ["casual"] } },
    { tags: { $in: ["work"] } },
    { favourite: true },
    { clothes: { $all: [ID_A, ID_B] } },
  ]);
});

test("buildMatchFilter keeps outfits whose temperature range overlaps the chosen one", () => {
  const filter = buildMatchFilter(
    USER,
    parseMatchQuery({ minTemp: "5", maxTemp: "15" })
  );

  assert.deepEqual(filter.$and, [
    { max_temp: { $gte: 5 }, min_temp: { $lte: 15 } },
  ]);
});

test("buildMatchFilter matches nothing for an invalid ?item= id", () => {
  const filter = buildMatchFilter(USER, parseMatchQuery({ item: "nope" }));

  assert.deepEqual(filter.$and, [{ _id: null }]);
});

test("buildMatchFilter searches clothing names (via ids), colours, styles and tags", () => {
  const filter = buildMatchFilter(
    USER,
    parseMatchQuery({ search: "  Lin.en " }),
    [ID_A]
  );

  const [search] = filter.$and;
  const [clothes, colors] = search.$or;

  assert.deepEqual(clothes, { clothes: { $in: [ID_A] } });
  // Special characters are matched literally and case is ignored.
  assert.ok(colors.colors.test("dark LIN.EN"));
  assert.ok(!colors.colors.test("linxen"));
});

test("groupClothesByType groups by type and ignores unknown types", () => {
  const grouped = groupClothesByType([
    { _id: "1", type: "top" },
    { _id: "2", type: "outer" },
    { _id: "3", type: "hat" },
  ]);

  assert.deepEqual(grouped.top.map((item) => item._id), ["1"]);
  assert.deepEqual(grouped.outer.map((item) => item._id), ["2"]);
  assert.equal(grouped.bottom.length, 0);
});
