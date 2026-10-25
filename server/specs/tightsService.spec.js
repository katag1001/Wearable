const test = require("node:test");
const assert = require("node:assert/strict");

const {
  TIGHTS_SHIFT,
  canWearTights,
  takesTights,
  tightsItemOf,
  tightsRange,
  savedMinTempFloor,
} = require("../services/tightsService.js");
const { NO_OUTER_MIN_TEMP, OUTER_MIN_TEMPS, SKIRT_DRESS_MIN_TEMP } = require("../constants/temperatureGroups.js");
const { todayFitOf } = require("../services/todaySelectionService.js");

const top = (subtype) => ({ type: "top", subtype });
const bottom = (subtype, wearWithTights) => ({ type: "bottom", subtype, wearWithTights });
const onepiece = (subtype, wearWithTights) => ({ type: "onepiece", subtype, wearWithTights });
const outer = (subtype) => ({ type: "outer", subtype });

// A skirt outfit with a coat whose floor (6) is below the test days.
const COATED = [top("Warm jumper"), bottom("Midi-skirt"), outer("Trench coat")];

test("a skirt with a warm top or an outer can take tights", () => {
  assert.equal(canWearTights([top("Short t-shirt"), top("Warm jumper"), bottom("Mini skirt")]), true);
  assert.equal(canWearTights([top("Vest"), bottom("Midi-skirt"), outer("Blazer")]), true);
});

test("a skirt without a warm top or an outer can't", () => {
  assert.equal(canWearTights([top("Long t-shirt"), bottom("Midi-skirt")]), false);
  assert.equal(canWearTights([top("Light cardigan"), bottom("Maxi skirt")]), false);
});

test("dresses follow the same rule; summer, evening and wedding guest dresses never take tights", () => {
  assert.equal(canWearTights([onepiece("Winter dress")]), false);
  assert.equal(canWearTights([onepiece("Winter dress"), outer("Trench coat")]), true);
  assert.equal(canWearTights([onepiece("Summer dress"), outer("Denim jacket")]), false);
  assert.equal(canWearTights([onepiece("Evening dress"), outer("Blazer")]), false);
  assert.equal(canWearTights([onepiece("Wedding guest dress"), outer("Blazer")]), false);
});

test("fancy shorts take tights by default; other shorts don't", () => {
  assert.equal(canWearTights([top("Warm jumper"), top("Short t-shirt"), bottom("Fancy Shorts")]), true);
  assert.equal(canWearTights([top("Warm jumper"), top("Short t-shirt"), bottom("Denim shorts")]), false);
});

test("the item's own answer replaces its subtype's default", () => {
  assert.equal(canWearTights([bottom("Mini skirt", false), outer("Trench coat")]), false);
  assert.equal(canWearTights([onepiece("Summer dress", true), outer("Denim jacket")]), true);
  assert.equal(canWearTights([bottom("Denim shorts", true), outer("Trench coat")]), true);
});

test("playsuits and trousers never take tights, whatever the item says", () => {
  assert.equal(canWearTights([onepiece("Playsuit", true), outer("Denim jacket")]), false);
  assert.equal(canWearTights([top("Short t-shirt"), bottom("Jeans"), outer("Trench coat")]), false);
});

test("the tights range is the stored range moved colder at both ends", () => {
  assert.deepEqual(tightsRange({ min: 12, max: 19 }), { min: 12 - TIGHTS_SHIFT, max: 19 - TIGHTS_SHIFT });
});

test("the tights range never takes the minimum below the floor, nor lifts it", () => {
  assert.deepEqual(tightsRange({ min: 15, max: 22 }, 14), { min: 14, max: 22 - TIGHTS_SHIFT });
  assert.deepEqual(tightsRange({ min: 12, max: 19 }, 14), { min: 12, max: 19 - TIGHTS_SHIFT });
});

test("a saved match's floor is the no-outer or outer floor, plus the preference shift", () => {
  assert.equal(savedMinTempFloor([top("Warm jumper"), bottom("Mini skirt")]), NO_OUTER_MIN_TEMP);
  assert.equal(savedMinTempFloor([top("Warm jumper"), bottom("Mini skirt")], "cold"), NO_OUTER_MIN_TEMP + 1);
  assert.equal(
    savedMinTempFloor(COATED),
    Math.max(OUTER_MIN_TEMPS["Trench coat"], SKIRT_DRESS_MIN_TEMP - TIGHTS_SHIFT)
  );
});

test("with tights, a skirt or dress can go TIGHTS_SHIFT below its bare-legs floor", () => {
  const warmCoat = [top("Warm jumper"), bottom("Mini skirt"), outer("Puffer coat")];

  assert.ok(OUTER_MIN_TEMPS["Puffer coat"] < SKIRT_DRESS_MIN_TEMP - TIGHTS_SHIFT);
  assert.equal(savedMinTempFloor(warmCoat), SKIRT_DRESS_MIN_TEMP - TIGHTS_SHIFT);
});

test("Today doesn't use tights to take an outfit with no outer below its floor", () => {
  // Unfloored, tights would make it 12-19 - a close match for the day.
  const day = { min: 11, max: 18 };
  const jumperAndSkirt = {
    min_temp: NO_OUTER_MIN_TEMP,
    max_temp: 21,
    tights: true,
    clothes: [top("Warm jumper"), bottom("Mini skirt")],
  };

  assert.equal(todayFitOf(jumperAndSkirt, day), null);
  assert.deepEqual(
    todayFitOf({ ...jumperAndSkirt, clothes: COATED }, day),
    { tier: 0, withTights: true }
  );
});

test("Today uses the tights range only when it fits better", () => {
  const day = { min: 9, max: 12 };
  const range = { min_temp: day.min + TIGHTS_SHIFT, max_temp: day.max + TIGHTS_SHIFT };

  assert.deepEqual(todayFitOf({ ...range, tights: true, clothes: COATED }, day), { tier: 0, withTights: true });
  assert.equal(todayFitOf({ ...range, tights: false, clothes: COATED }, day), null);

  // Fits without tights already - no tights needed.
  assert.deepEqual(
    todayFitOf({ min_temp: day.min, max_temp: day.max, tights: true, clothes: COATED }, day),
    { tier: 0, withTights: false }
  );
});

test("an outfit flagged noTights doesn't take tights, even when its items allow them", () => {
  assert.equal(takesTights({ tights: true }), true);
  assert.equal(takesTights({ tights: true, noTights: true }), false);
  assert.equal(takesTights({ tights: false }), false);
});

test("tightsItemOf finds the outfit's skirt, dress or shorts", () => {
  const skirt = bottom("Midi-skirt");

  assert.equal(tightsItemOf([top("Warm jumper"), skirt]), skirt);
  assert.equal(tightsItemOf([top("Warm jumper"), bottom("Jeans")]), undefined);
});

test("Today doesn't use the tights range for an outfit flagged noTights", () => {
  const day = { min: 9, max: 12 };
  const range = { min_temp: day.min + TIGHTS_SHIFT, max_temp: day.max + TIGHTS_SHIFT };

  assert.equal(todayFitOf({ ...range, tights: true, noTights: true, clothes: COATED }, day), null);
});
