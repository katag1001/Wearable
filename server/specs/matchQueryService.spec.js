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
const { TIGHTS_SHIFT } = require("../services/tightsService.js");

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

// Outfits that can take tights also pass on their tights range: the stored
// range checked against the chosen one moved up by the shift.
const orTights = (withoutTights, withTights) => ({
  $or: [withoutTights, { $and: [{ tights: true }, { noTights: { $ne: true } }, withTights] }],
});

const closeOrContaining = (min, max) => ({
  $or: [
    {
      min_temp: { $gte: min - 1.5, $lte: min + 2 },
      max_temp: { $gte: max - 2, $lte: max + 1.5 },
    },
    { min_temp: { $lte: min }, max_temp: { $gte: max } },
  ],
});

test("buildMatchFilter keeps outfits close to both ends (1.5 beyond, 2 inside), or containing the chosen range", () => {
  const filter = buildMatchFilter(
    USER,
    parseMatchQuery({ minTemp: "5", maxTemp: "15" })
  );

  assert.deepEqual(filter.$and, [
    orTights(closeOrContaining(5, 15), closeOrContaining(5 + TIGHTS_SHIFT, 15 + TIGHTS_SHIFT)),
  ]);
});

test("buildMatchFilter checks only the chosen end when one temperature is given", () => {
  assert.deepEqual(
    buildMatchFilter(USER, parseMatchQuery({ minTemp: "5" })).$and,
    [orTights({ min_temp: { $lte: 7 } }, { min_temp: { $lte: 7 + TIGHTS_SHIFT } })]
  );
  assert.deepEqual(
    buildMatchFilter(USER, parseMatchQuery({ maxTemp: "15" })).$and,
    [orTights({ max_temp: { $gte: 13 } }, { max_temp: { $gte: 13 + TIGHTS_SHIFT } })]
  );
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
