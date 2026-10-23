const test = require("node:test");
const assert = require("node:assert/strict");

const { computePresetTemperatureRange } = require("../services/presetTemperatureService.js");
const {
  TOP_GROUPS,
  BOTTOM_GROUPS,
  BASE_RANGES,
  ONEPIECE_RANGES,
  OUTER_WARMTH_POINTS,
  NO_OUTER_MIN_TEMP,
  OUTER_MIN_TEMPS,
  SKIRT_DRESS_MIN_TEMP,
  SKIRT_DRESS_SUBTYPES,
  TOP_LAYER_POINTS,
  WARM_OVER_LONG_POINTS,
  ONEPIECE_LAYER_POINTS,
  LAYERED_MAX_TEMPS,
  OUTER_CEILING_BASE,
  OUTER_MIN_SPAN,
  MIN_SPAN,
  TEMPERATURE_PREFERENCE_SHIFT,
  LONG_BOTTOM_MAX_TEMP,
} = require("../constants/temperatureGroups.js");
const { subtypesByGender } = require("../constants/matchScoreBaseline.js");

// Expectations are worked out from temperatureGroups.js, so these tests
// check the rules, not the particular numbers - they keep passing when
// the numbers are tuned.

const top = (subtype) => ({ type: "top", subtype });
const bottom = (subtype) => ({ type: "bottom", subtype });
const onepiece = (subtype) => ({ type: "onepiece", subtype });
const outer = (subtype) => ({ type: "outer", subtype });

const range = (items, preference) => {
  const { min_temp, max_temp } = computePresetTemperatureRange(items, preference);
  return [min_temp, max_temp];
};

// The maximum caps (layers, long bottom), applied before the preference.
const cap = ([min, max], limit) => (max > limit ? [Math.min(min, limit), limit] : [min, max]);
const capLong = (pair) => cap(pair, LONG_BOTTOM_MAX_TEMP);

// An outer moves the range down, caps the maximum at the ceiling and keeps
// the range at least OUTER_MIN_SPAN wide.
const withOuters = ([min, max], points) => {
  const cappedMax = Math.min(max - points, OUTER_CEILING_BASE - points);
  return [Math.min(min - points, cappedMax - OUTER_MIN_SPAN), cappedMax];
};

const withFloor = ([min, max], floor) => (min < floor ? [floor, Math.max(max, floor)] : [min, max]);

test("every subtype of every gender has a preset", () => {
  ["man", "woman", "unisex"].forEach((gender) => {
    const { top: tops, bottom: bottoms, onepiece: onepieces, outer: outers } = subtypesByGender[gender];
    const groupedTops = Object.values(TOP_GROUPS).flat();
    const groupedBottoms = Object.values(BOTTOM_GROUPS).flat();

    tops.forEach((subtype) => assert.ok(groupedTops.includes(subtype), `${gender}: ${subtype} has no top group`));
    bottoms.forEach((subtype) => assert.ok(groupedBottoms.includes(subtype), `${gender}: ${subtype} has no bottom group`));
    onepieces.forEach((subtype) => assert.ok(ONEPIECE_RANGES[subtype], `${gender}: ${subtype} has no range`));
    outers.forEach((subtype) => {
      assert.ok(OUTER_WARMTH_POINTS[subtype] !== undefined, `${gender}: ${subtype} has no warmth points`);
      assert.ok(OUTER_MIN_TEMPS[subtype] !== undefined, `${gender}: ${subtype} has no minimum`);
    });
  });
});

test("top + bottom uses the base range for their groups, floored without an outer", () => {
  const expected = capLong(withFloor(BASE_RANGES.short.long, NO_OUTER_MIN_TEMP));
  assert.deepEqual(range([top("Short t-shirt"), bottom("Jeans")]), expected);
});

test("the innermost top sets the base and each top over it moves the range down", () => {
  const [min, max] = BASE_RANGES.short.long;
  const points = TOP_LAYER_POINTS.warm;
  const expected = capLong(cap(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMPS.warmJumper));

  assert.deepEqual(range([top("Warm jumper"), top("Short t-shirt"), bottom("Jeans")]), expected);
});

test("a light jumper/cardigan layer caps the maximum", () => {
  const [min, max] = BASE_RANGES.short.short;
  const points = TOP_LAYER_POINTS.long;
  const expected = cap(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMPS.lightJumper);

  assert.deepEqual(range([top("Short t-shirt"), top("Light cardigan"), bottom("Mini skirt")]), expected);
});

test("a non-jumper layer uses the 'other' cap", () => {
  const [min, max] = BASE_RANGES.short.short;
  const points = TOP_LAYER_POINTS.long;
  const expected = cap(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMPS.other);

  assert.deepEqual(range([top("Short t-shirt"), top("Buttondown shirt"), bottom("Mini skirt")]), expected);
});

test("with several layers the warmest layer's cap wins", () => {
  const [, max] = range([top("Short t-shirt"), top("Buttondown shirt"), top("Light jumper"), bottom("Mini skirt")]);
  assert.ok(max <= LAYERED_MAX_TEMPS.lightJumper);
});

test("a single top has no layer cap", () => {
  assert.deepEqual(range([top("Light cardigan"), bottom("Mini skirt")]), withFloor(BASE_RANGES.long.short, NO_OUTER_MIN_TEMP));
});

test("an outer moves the range down by its points, capped at the ceiling and floored at its minimum", () => {
  const [min, max] = BASE_RANGES.short.long;
  const points = OUTER_WARMTH_POINTS["Puffer coat"];
  const expected = capLong(withFloor(withOuters([min, max], points), OUTER_MIN_TEMPS["Puffer coat"]));

  assert.deepEqual(range([top("Short t-shirt"), bottom("Jeans"), outer("Puffer coat")]), expected);
});

test("a light outfit under an outer is widened to the minimum span", () => {
  const [min, max] = BASE_RANGES.short.short;
  const points = OUTER_WARMTH_POINTS["Leather jacket"];
  const cappedMax = Math.min(max - points, OUTER_CEILING_BASE - points);
  assert.ok(min - points > cappedMax - OUTER_MIN_SPAN, "fixture should need widening");

  const expected = withFloor([cappedMax - OUTER_MIN_SPAN, cappedMax], OUTER_MIN_TEMPS["Leather jacket"]);
  assert.deepEqual(range([top("Vest"), bottom("Mini skirt"), outer("Leather jacket")]), expected);
});

test("two outers add their points together and are floored at the lower outer floor", () => {
  const [min, max] = BASE_RANGES.short.long;
  const points = OUTER_WARMTH_POINTS["Jacket"] + OUTER_WARMTH_POINTS["Puffer coat"];
  const floor = Math.min(OUTER_MIN_TEMPS["Jacket"], OUTER_MIN_TEMPS["Puffer coat"]);
  const expected = capLong(withFloor(withOuters([min, max], points), floor));

  assert.deepEqual(range([top("Short t-shirt"), bottom("Jeans"), outer("Jacket"), outer("Puffer coat")]), expected);
});

test("a blazer under a trench coat is floored at the trench coat's minimum", () => {
  const items = [top("Long t-shirt"), top("Warm jumper"), bottom("Jeans"), outer("Blazer"), outer("Trench coat")];

  assert.equal(range(items)[0], Math.min(OUTER_MIN_TEMPS["Blazer"], OUTER_MIN_TEMPS["Trench coat"]));
});

test("a warm top over a long top moves the range by WARM_OVER_LONG_POINTS, not the full warm points", () => {
  const [min, max] = BASE_RANGES.long.long;
  const points = WARM_OVER_LONG_POINTS;
  const expected = capLong(cap(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMPS.warmJumper));

  assert.ok(WARM_OVER_LONG_POINTS < TOP_LAYER_POINTS.warm);
  assert.deepEqual(range([top("Warm jumper"), top("Long t-shirt"), bottom("Jeans")]), expected);
});

test("a waistcoat is never the innermost top when there's another one", () => {
  const [min, max] = BASE_RANGES.long.short;
  const points = TOP_LAYER_POINTS.short;
  const expected = cap(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMPS.other);

  assert.deepEqual(range([top("Waistcoat"), top("Long t-shirt"), bottom("Mini skirt")]), expected);
});

test("a waistcoat on its own is a short top", () => {
  assert.deepEqual(range([top("Waistcoat"), bottom("Mini skirt")]), range([top("Vest"), bottom("Mini skirt")]));
});

test("a skirt or dress outfit is never below the skirt/dress floor, even with two outers", () => {
  const skirt = range([top("Long t-shirt"), top("Warm jumper"), bottom("Mini skirt"), outer("Blazer"), outer("Trench coat")]);
  const dress = range([onepiece("Winter dress"), top("Warm jumper"), outer("Jacket"), outer("Puffer coat")]);
  const jeans = range([top("Long t-shirt"), top("Warm jumper"), bottom("Jeans"), outer("Jacket"), outer("Puffer coat")]);

  assert.equal(skirt[0], SKIRT_DRESS_MIN_TEMP);
  assert.equal(dress[0], SKIRT_DRESS_MIN_TEMP);
  assert.ok(jeans[0] < SKIRT_DRESS_MIN_TEMP);
});

test("the higher of the outer floor and the skirt/dress floor wins", () => {
  const blazerFloor = OUTER_MIN_TEMPS["Blazer"];
  const duffleFloor = OUTER_MIN_TEMPS["Duffle coat"];

  assert.ok(blazerFloor > SKIRT_DRESS_MIN_TEMP && duffleFloor < SKIRT_DRESS_MIN_TEMP);
  assert.ok(range([top("Long t-shirt"), bottom("Mini skirt"), outer("Blazer")])[0] >= blazerFloor);
  assert.equal(range([top("Warm jumper"), bottom("Midi-skirt"), outer("Duffle coat")])[0], SKIRT_DRESS_MIN_TEMP);
});

test("every skirt/dress subtype is a real bottom or onepiece", () => {
  const bottoms = Object.values(BOTTOM_GROUPS).flat();
  const onepieces = Object.keys(ONEPIECE_RANGES);

  SKIRT_DRESS_SUBTYPES.forEach((subtype) => {
    assert.ok(bottoms.includes(subtype) || onepieces.includes(subtype), subtype);
  });
});

test("the long-bottom cap is applied before the preference shift", () => {
  [null, "cold", "hot"].forEach((preference) => {
    const [, max] = range([top("Vest"), bottom("Jeans")], preference);
    const shift = TEMPERATURE_PREFERENCE_SHIFT[preference] || 0;
    assert.equal(max, LONG_BOTTOM_MAX_TEMP + shift, `${preference}`);
  });
});

test("a onepiece alone uses its own range", () => {
  const expected = withFloor(ONEPIECE_RANGES["Summer dress"], NO_OUTER_MIN_TEMP);
  assert.deepEqual(range([onepiece("Summer dress")]), expected);
});

test("tops over a onepiece use the onepiece layer points", () => {
  const [min, max] = ONEPIECE_RANGES["Casual dress"];
  const points = ONEPIECE_LAYER_POINTS.warm;
  const expected = cap(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMPS.warmJumper);

  assert.deepEqual(range([onepiece("Casual dress"), top("Warm jumper")]), expected);
});

test("a top over a onepiece moves it down and uses the same layer caps", () => {
  const [min, max] = ONEPIECE_RANGES["Summer dress"];
  const points = ONEPIECE_LAYER_POINTS.long;
  const expected = cap(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMPS.lightJumper);

  assert.deepEqual(range([onepiece("Summer dress"), top("Light cardigan")]), expected);
});

test("the temperature preference shifts both ends of the saved range", () => {
  const [min, max] = range([top("Short t-shirt"), bottom("Midi-skirt")]);

  assert.deepEqual(range([top("Short t-shirt"), bottom("Midi-skirt")], "cold"), [
    min + TEMPERATURE_PREFERENCE_SHIFT.cold,
    max + TEMPERATURE_PREFERENCE_SHIFT.cold,
  ]);
  assert.deepEqual(range([top("Short t-shirt"), bottom("Midi-skirt")], "hot"), [
    min + TEMPERATURE_PREFERENCE_SHIFT.hot,
    max + TEMPERATURE_PREFERENCE_SHIFT.hot,
  ]);
});

test("the minimum is never above the maximum", () => {
  const [min, max] = range([top("Warm jumper"), top("Turtleneck jumper"), bottom("Jeans")]);
  assert.ok(min <= max);
});

test("a range narrower than the minimum span is widened upwards from its floor", () => {
  // Two warm tops with no outer drop far below the no-outer floor, so the
  // floor collapses the range to a single temperature before widening.
  const [min, max] = range([top("Warm jumper"), top("Turtleneck jumper"), bottom("Jeans")]);
  assert.deepEqual([min, max], [NO_OUTER_MIN_TEMP, NO_OUTER_MIN_TEMP + MIN_SPAN]);
});

test("subtypes with no preset fall back and are reported", () => {
  const { unknownSubtypes } = computePresetTemperatureRange([top("Mystery top"), bottom("Jeans")]);
  assert.deepEqual(unknownSubtypes, ["Mystery top"]);
});
