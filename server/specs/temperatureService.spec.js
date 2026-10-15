const test = require("node:test");
const assert = require("node:assert/strict");

const {
  temperatureOverlapFraction,
  todayCoverageFraction,
} = require("../services/temperatureService.js");

test("temperatureOverlapFraction is the share of the outfit's range inside today's", () => {
  assert.equal(temperatureOverlapFraction({ min: 10, max: 20 }, { min: 15, max: 30 }), 0.5);
  assert.equal(temperatureOverlapFraction({ min: 10, max: 20 }, { min: 0, max: 30 }), 1);
  assert.equal(temperatureOverlapFraction({ min: 10, max: 20 }, { min: 25, max: 30 }), 0);
});

test("a single-temperature range counts fully if today includes it, and not at all otherwise", () => {
  assert.equal(temperatureOverlapFraction({ min: 12, max: 12 }, { min: 10, max: 15 }), 1);
  assert.equal(temperatureOverlapFraction({ min: 12, max: 12 }, { min: 13, max: 15 }), 0);
});

test("todayCoverageFraction is the share of today's range the outfit covers", () => {
  // Covers the whole day.
  assert.equal(todayCoverageFraction({ min: 5, max: 25 }, { min: 11, max: 18 }), 1);
  assert.equal(todayCoverageFraction({ min: 11, max: 18 }, { min: 11, max: 18 }), 1);
  // 12-18 of 10-20: 6 of 10 degrees.
  assert.equal(todayCoverageFraction({ min: 12, max: 18 }, { min: 10, max: 20 }), 0.6);
  // No overlap.
  assert.equal(todayCoverageFraction({ min: 25, max: 30 }, { min: 10, max: 20 }), 0);
});

test("a narrow outfit inside a wide day only covers part of it", () => {
  assert.equal(todayCoverageFraction({ min: 14, max: 16 }, { min: 10, max: 20 }), 0.2);
});

test("a single-temperature day counts fully if it's inside the outfit's range, and not at all otherwise", () => {
  assert.equal(todayCoverageFraction({ min: 10, max: 20 }, { min: 15, max: 15 }), 1);
  assert.equal(todayCoverageFraction({ min: 10, max: 14 }, { min: 15, max: 15 }), 0);
});
