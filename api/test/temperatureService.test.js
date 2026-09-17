const test = require("node:test");
const assert = require("node:assert/strict");

const { computeTemperatureRange } = require("../services/temperatureService.js");

test("top + bottom: base range is the overlap of the two", () => {
  const items = [
    { type: "top", min_temp: 10, max_temp: 25 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: 10,
    max_temp: 22,
  });
});

test("2 tops: base min drops by 2, max untouched", () => {
  const items = [
    { type: "top", min_temp: 10, max_temp: 25 },
    { type: "top", min_temp: 12, max_temp: 30 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: 10,
    max_temp: 22,
  });
});

test("1 outer replaces the floor with the outer's own min_temp", () => {
  const items = [
    { type: "top", min_temp: 10, max_temp: 25 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
    { type: "outer", min_temp: -5, max_temp: 18 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: -5,
    max_temp: 22,
  });
});

test("2 outers: the floor drops a further 4 degrees below the coldest outer", () => {
  const items = [
    { type: "top", min_temp: 10, max_temp: 25 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
    { type: "outer", min_temp: -5, max_temp: 18 },
    { type: "outer", min_temp: 0, max_temp: 10 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: -9,
    max_temp: 22,
  });
});

test("2 tops + 2 outers stack both penalties", () => {
  const items = [
    { type: "top", min_temp: 10, max_temp: 25 },
    { type: "top", min_temp: 12, max_temp: 30 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
    { type: "outer", min_temp: -5, max_temp: 18 },
    { type: "outer", min_temp: 0, max_temp: 10 },
  ];

  // The -2 top penalty only ever applies to the base min_temp, which then
  // gets entirely replaced by the outer floor - so only the outer penalty
  // shows up in the final result.
  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: -9,
    max_temp: 22,
  });
});

test("non-overlapping base items: auto-search candidate is rejected", () => {
  const items = [
    { type: "top", min_temp: 20, max_temp: 30 },
    { type: "bottom", min_temp: 0, max_temp: 10 },
  ];

  assert.equal(computeTemperatureRange(items, { isUserMade: false }), null);
});

test("non-overlapping base items: user-made outfit falls back to the union, never rejected", () => {
  const items = [
    { type: "top", min_temp: 20, max_temp: 30 },
    { type: "bottom", min_temp: 0, max_temp: 10 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: true }), {
    min_temp: 0,
    max_temp: 30,
  });
});

test("onepiece alone: base range is just that item's own range", () => {
  const items = [{ type: "onepiece", min_temp: 15, max_temp: 30 }];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: 15,
    max_temp: 30,
  });
});
