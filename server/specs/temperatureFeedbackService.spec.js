const test = require("node:test");
const assert = require("node:assert/strict");

const { isTemperatureFeel, shiftedRange } = require("../services/temperatureFeedbackService.js");
const { TEMPERATURE_FEEDBACK_SHIFT } = require("../constants/scoring.js");

test("too hot moves the range up, for warmer days", () => {
  assert.deepEqual(shiftedRange({ min_temp: 10, max_temp: 18 }, "too_hot"), {
    min_temp: 10 + TEMPERATURE_FEEDBACK_SHIFT,
    max_temp: 18 + TEMPERATURE_FEEDBACK_SHIFT,
  });
});

test("too cold moves the range down, for colder days", () => {
  assert.deepEqual(shiftedRange({ min_temp: 10, max_temp: 18 }, "too_cold"), {
    min_temp: 10 - TEMPERATURE_FEEDBACK_SHIFT,
    max_temp: 18 - TEMPERATURE_FEEDBACK_SHIFT,
  });
});

test("only too_hot and too_cold are accepted", () => {
  assert.equal(isTemperatureFeel("too_hot"), true);
  assert.equal(isTemperatureFeel("too_cold"), true);
  assert.equal(isTemperatureFeel("constructor"), false);
  assert.equal(isTemperatureFeel(undefined), false);
});
