const test = require("node:test");
const assert = require("node:assert/strict");

const { TIGHTS_SHIFT, canWearTights, tightsRange } = require("../services/tightsService.js");
const { todayFitOf } = require("../services/todaySelectionService.js");

const top = (subtype) => ({ type: "top", subtype });
const bottom = (subtype) => ({ type: "bottom", subtype });
const onepiece = (subtype) => ({ type: "onepiece", subtype });
const outer = (subtype) => ({ type: "outer", subtype });

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

test("shorts, playsuits and trousers never take tights", () => {
  assert.equal(canWearTights([top("Warm jumper"), top("Short t-shirt"), bottom("Denim shorts")]), false);
  assert.equal(canWearTights([onepiece("Playsuit"), outer("Denim jacket")]), false);
  assert.equal(canWearTights([top("Short t-shirt"), bottom("Jeans"), outer("Trench coat")]), false);
});

test("the tights range is the stored range moved colder at both ends", () => {
  assert.deepEqual(tightsRange({ min: 12, max: 19 }), { min: 12 - TIGHTS_SHIFT, max: 19 - TIGHTS_SHIFT });
});

test("Today uses the tights range only when it fits better", () => {
  const day = { min: 9, max: 16 };
  const range = { min_temp: day.min + TIGHTS_SHIFT, max_temp: day.max + TIGHTS_SHIFT };

  assert.deepEqual(todayFitOf({ ...range, tights: true }, day), { tier: 0, withTights: true });
  assert.equal(todayFitOf({ ...range, tights: false }, day), null);

  // Fits without tights already - no tights needed.
  assert.deepEqual(
    todayFitOf({ min_temp: day.min, max_temp: day.max, tights: true }, day),
    { tier: 0, withTights: false }
  );
});
