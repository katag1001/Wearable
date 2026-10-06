const test = require("node:test");
const assert = require("node:assert/strict");

const {
  temperatureOverlapFraction,
  matchesTodayTemperature,
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

test("matchesTodayTemperature needs at least half the outfit's range inside today's", () => {
  assert.equal(matchesTodayTemperature({ min: 10, max: 20 }, { min: 15, max: 30 }), true);
  assert.equal(matchesTodayTemperature({ min: 10, max: 20 }, { min: 16, max: 30 }), false);
});
