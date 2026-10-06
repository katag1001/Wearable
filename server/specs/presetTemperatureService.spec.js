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
  TOP_LAYER_POINTS,
  OUTER_LAYER_OVERLAP,
  OUTER_CEILING_BASE,
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

// Every long-bottom outfit's saved maximum is capped as the last step.
const capLong = ([min, max]) =>
  max > LONG_BOTTOM_MAX_TEMP ? [Math.min(min, LONG_BOTTOM_MAX_TEMP), LONG_BOTTOM_MAX_TEMP] : [min, max];

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
  const expected = capLong(withFloor([min - points, max - points], NO_OUTER_MIN_TEMP));

  assert.deepEqual(range([top("Warm jumper"), top("Short t-shirt"), bottom("Jeans")]), expected);
});

test("an outer moves the range down by its points, capped at the ceiling and floored at its minimum", () => {
  const [min, max] = BASE_RANGES.short.long;
  const points = OUTER_WARMTH_POINTS["Puffer coat"];
  const expected = capLong(withFloor(
    [min - points, Math.min(max - points, OUTER_CEILING_BASE - points)],
    OUTER_MIN_TEMPS["Puffer coat"]
  ));

  assert.deepEqual(range([top("Short t-shirt"), bottom("Jeans"), outer("Puffer coat")]), expected);
});

test("two outers add their points together and have no floor", () => {
  const [min, max] = BASE_RANGES.short.long;
  const points = OUTER_WARMTH_POINTS["Jacket"] + OUTER_WARMTH_POINTS["Puffer coat"];
  const expected = capLong([min - points, Math.min(max - points, OUTER_CEILING_BASE - points)]);

  assert.deepEqual(range([top("Short t-shirt"), bottom("Jeans"), outer("Jacket"), outer("Puffer coat")]), expected);
});

test("an outfit with a long bottom is never saved with a maximum above the cap, whatever the preference", () => {
  [null, "cold", "hot"].forEach((preference) => {
    const [, max] = range([top("Vest"), bottom("Jeans")], preference);
    assert.ok(max <= LONG_BOTTOM_MAX_TEMP, `${preference}: max ${max} is above ${LONG_BOTTOM_MAX_TEMP}`);
  });
});

test("a onepiece alone uses its own range", () => {
  const expected = withFloor(ONEPIECE_RANGES["Summer dress"], NO_OUTER_MIN_TEMP);
  assert.deepEqual(range([onepiece("Summer dress")]), expected);
});

test("a cover-up over a onepiece moves it down and caps the maximum", () => {
  const [min, max] = ONEPIECE_RANGES["Summer dress"];
  const points = TOP_LAYER_POINTS.long;
  const expected = withFloor(
    [min - points, Math.min(max - points, min + OUTER_LAYER_OVERLAP)],
    NO_OUTER_MIN_TEMP
  );

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

test("subtypes with no preset fall back and are reported", () => {
  const { unknownSubtypes } = computePresetTemperatureRange([top("Mystery top"), bottom("Jeans")]);
  assert.deepEqual(unknownSubtypes, ["Mystery top"]);
});
