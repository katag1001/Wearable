const test = require("node:test");
const assert = require("node:assert/strict");

const { jitter, spreadSharedItems } = require("../services/todayDiversityService.js");
const { RANKING_JITTER, SPREAD_LOOKBACK } = require("../constants/todayOutfits.js");

// An outfit made of the given clothing item ids, populated like the
// controller does ({ _id }).
const outfit = (id, ...items) => ({ _id: id, clothes: items.map((item) => ({ _id: item })) });

const ids = (matches) => matches.map((entry) => entry._id);

test("jitter stays within +/- RANKING_JITTER", () => {
  assert.equal(jitter(() => 0), -RANKING_JITTER);
  assert.equal(jitter(() => 0.5), 0);
  assert.ok(Math.abs(jitter(() => 0.999999) - RANKING_JITTER) < 1e-5);
});

test("outfits sharing an item are moved apart", () => {
  const spread = spreadSharedItems([
    outfit("cardi1", "cardi", "jeans"),
    outfit("cardi2", "cardi", "skirt"),
    outfit("other", "tee", "shorts"),
  ]);

  assert.deepEqual(ids(spread), ["cardi1", "other", "cardi2"]);
});

test(`an item isn't repeated within ${SPREAD_LOOKBACK} outfits while there's a choice`, () => {
  const spread = spreadSharedItems([
    outfit("a1", "a"),
    outfit("a2", "a"),
    outfit("b", "b"),
    outfit("c", "c"),
    outfit("d", "d"),
  ]);

  assert.deepEqual(ids(spread), ["a1", "b", "c", "d", "a2"]);
});

test("when everything shares something, the one sharing the fewest items is next", () => {
  const spread = spreadSharedItems([
    outfit("first", "cardi", "jeans"),
    outfit("both", "cardi", "jeans", "tee"),
    outfit("one", "cardi", "skirt"),
  ]);

  assert.deepEqual(ids(spread), ["first", "one", "both"]);
});

test("ranking order is kept when nothing is shared", () => {
  const ranked = [outfit("1", "a"), outfit("2", "b"), outfit("3", "c")];

  assert.deepEqual(ids(spreadSharedItems(ranked)), ["1", "2", "3"]);
});

test("outfits already placed above are taken into account, and the count is respected", () => {
  const spread = spreadSharedItems(
    [outfit("cardi", "cardi"), outfit("tee", "tee"), outfit("skirt", "skirt")],
    [outfit("above", "cardi")],
    2
  );

  assert.deepEqual(ids(spread), ["tee", "skirt"]);
});

test("unpopulated clothes (plain ids) are compared too", () => {
  const spread = spreadSharedItems([
    { _id: "x1", clothes: ["x"] },
    { _id: "x2", clothes: ["x"] },
    { _id: "y", clothes: ["y"] },
  ]);

  assert.deepEqual(ids(spread), ["x1", "y", "x2"]);
});
