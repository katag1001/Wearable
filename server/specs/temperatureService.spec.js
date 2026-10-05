const test = require("node:test");
const assert = require("node:assert/strict");

const { computeTemperatureRange } = require("../services/temperatureService.js");

test("top + bottom: base range is the overlap of the two", () => {
  const items = [
    { type: "top", min_temp: 16, max_temp: 25 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: 16,
    max_temp: 22,
  });
});

test("2 tops combine as layers: coldest top's min to hottest top's max", () => {
  // t-shirt + warm jumper never overlap on their own, but layered they do.
  const items = [
    { type: "top", min_temp: 15, max_temp: 35 },
    { type: "top", min_temp: -5, max_temp: 12 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
    { type: "outer", min_temp: -15, max_temp: 5 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: -15,
    max_temp: 22,
  });
});

test("2 tops never conflict on temperature, so they are never rejected for it", () => {
  const items = [
    { type: "top", min_temp: 25, max_temp: 35 },
    { type: "top", min_temp: -5, max_temp: 5 },
    { type: "bottom", min_temp: 0, max_temp: 30 },
  ];

  assert.notEqual(computeTemperatureRange(items, { isUserMade: false }), null);
});

test("no outer, 1 layer: floor is raised to 14 for a 'normal' preference", () => {
  // Both items are rated low on the assumption that layers go on top.
  const items = [
    { type: "top", min_temp: -2, max_temp: 20 },
    { type: "bottom", min_temp: -2, max_temp: 22 },
  ];

  assert.deepEqual(
    computeTemperatureRange(items, { isUserMade: false, temperaturePreference: "normal" }),
    { min_temp: 14, max_temp: 20 }
  );
});

test("no outer, 1 layer: floor is 15 for 'cold' and 13 for 'hot'", () => {
  const items = [
    { type: "top", min_temp: -2, max_temp: 20 },
    { type: "bottom", min_temp: -2, max_temp: 22 },
  ];

  assert.equal(
    computeTemperatureRange(items, { isUserMade: false, temperaturePreference: "cold" }).min_temp,
    15
  );
  assert.equal(
    computeTemperatureRange(items, { isUserMade: false, temperaturePreference: "hot" }).min_temp,
    13
  );
});

test("no outer, missing preference is treated as 'normal'", () => {
  const items = [
    { type: "top", min_temp: -2, max_temp: 20 },
    { type: "bottom", min_temp: -2, max_temp: 22 },
  ];

  assert.equal(computeTemperatureRange(items, { isUserMade: false }).min_temp, 14);
});

test("no outer, 2 tops: floor is 12 normal, 13 cold, 11 hot", () => {
  const items = [
    { type: "top", min_temp: 15, max_temp: 35 },
    { type: "top", min_temp: -5, max_temp: 12 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
  ];

  assert.deepEqual(
    computeTemperatureRange(items, { isUserMade: false, temperaturePreference: "normal" }),
    { min_temp: 12, max_temp: 22 }
  );
  assert.equal(
    computeTemperatureRange(items, { isUserMade: false, temperaturePreference: "cold" }).min_temp,
    13
  );
  assert.equal(
    computeTemperatureRange(items, { isUserMade: false, temperaturePreference: "hot" }).min_temp,
    11
  );
});

test("no outer, top over a onepiece counts as 2 layers", () => {
  const items = [
    { type: "top", min_temp: 0, max_temp: 15 },
    { type: "onepiece", min_temp: 0, max_temp: 15 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: 12,
    max_temp: 15,
  });
});

test("no outer: a base floor already above the minimum is left alone", () => {
  const items = [{ type: "onepiece", min_temp: 22, max_temp: 35 }];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: 22,
    max_temp: 35,
  });
});

test("no outer: a floor raised above the ceiling collapses to a point at the ceiling", () => {
  const items = [
    { type: "top", min_temp: -5, max_temp: 12 },
    { type: "bottom", min_temp: 0, max_temp: 15 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: false }), {
    min_temp: 12,
    max_temp: 12,
  });
});

test("1 outer replaces the floor with the outer's own min_temp, ignoring the no-outer minimum", () => {
  const items = [
    { type: "top", min_temp: 10, max_temp: 25 },
    { type: "bottom", min_temp: 5, max_temp: 22 },
    { type: "outer", min_temp: -5, max_temp: 18 },
  ];

  assert.deepEqual(
    computeTemperatureRange(items, { isUserMade: false, temperaturePreference: "cold" }),
    { min_temp: -5, max_temp: 22 }
  );
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
    { type: "outer", min_temp: -5, max_temp: 10 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: true }), {
    min_temp: -5,
    max_temp: 30,
  });
});

test("user-made with no outer gets the same no-outer minimum", () => {
  const items = [
    { type: "top", min_temp: 20, max_temp: 30 },
    { type: "bottom", min_temp: 0, max_temp: 10 },
  ];

  assert.deepEqual(computeTemperatureRange(items, { isUserMade: true }), {
    min_temp: 14,
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
