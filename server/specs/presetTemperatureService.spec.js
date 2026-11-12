const test = require("node:test");
const assert = require("node:assert/strict");

const { computePresetTemperatureRange } = require("../services/presetTemperatureService.js");
const {
  TOP_LEVELS,
  BOTTOM_LEVELS,
  BASE_RANGES,
  LAYER_BONUS,
  ONEPIECE_LAYER_POINTS,
  FABRIC_SHIFT_LIMIT,
  FABRIC_NAMED_SUBTYPES,
  ONEPIECE_RANGES,
  OUTER_WARMTH_POINTS,
  NO_OUTER_MIN_TEMP,
  OUTER_MIN_TEMPS,
  SKIRT_DRESS_MIN_TEMP,
  SKIRT_DRESS_SUBTYPES,
  LAYERED_MAX_TEMP,
  BOTTOM_MAX_TEMPS,
  SUBTYPE_MAX_TEMPS,
  OUTER_CEILING_BASE,
  OUTER_MIN_SPAN,
  MIN_SPAN,
  TEMPERATURE_PREFERENCE_SHIFT,
} = require("../constants/temperatureGroups.js");
const fabrics = require("../../shared/fabrics.json");
const { subtypesByGender } = require("../constants/matchScoreBaseline.js");

// Expectations are worked out from temperatureGroups.js, so these tests
// check the rules, not the particular numbers - they keep passing when
// the numbers are tuned.

const top = (subtype, fabric = "") => ({ type: "top", subtype, fabric });
const bottom = (subtype, fabric = "") => ({ type: "bottom", subtype, fabric });
const onepiece = (subtype, fabric = "") => ({ type: "onepiece", subtype, fabric });
const outer = (subtype, fabric = "") => ({ type: "outer", subtype, fabric });

const range = (items, preference) => {
  const { min_temp, max_temp } = computePresetTemperatureRange(items, preference);
  return [min_temp, max_temp];
};

const levelOf = (levels, subtype) =>
  Number(Object.keys(levels).find((level) => levels[level].includes(subtype)));

const shift = ([min, max], degrees) => [min - degrees, max - degrees];
const cap = ([min, max], limit) => (limit !== undefined && max > limit ? [Math.min(min, limit), limit] : [min, max]);
const withFloor = ([min, max], floor) => (min < floor ? [floor, Math.max(max, floor)] : [min, max]);
const withOuters = ([min, max], points) => {
  const cappedMax = Math.min(max - points, OUTER_CEILING_BASE - points);
  return [Math.min(min - points, cappedMax - OUTER_MIN_SPAN), cappedMax];
};
const widen = ([min, max]) => (max - min < MIN_SPAN ? [min, min + MIN_SPAN] : [min, max]);
const warmth = (name) => fabrics.find((fabric) => fabric.name === name).warmth;

const JEANS = "Straight leg jeans";
const JEANS_CAP = BOTTOM_MAX_TEMPS[levelOf(BOTTOM_LEVELS, JEANS)];

test("every subtype of every gender has a preset", () => {
  ["man", "woman", "unisex"].forEach((gender) => {
    const { top: tops, bottom: bottoms, onepiece: onepieces, outer: outers } = subtypesByGender[gender];

    tops.forEach((subtype) => assert.ok(levelOf(TOP_LEVELS, subtype), `${gender}: ${subtype} has no top level`));
    bottoms.forEach((subtype) => assert.ok(levelOf(BOTTOM_LEVELS, subtype), `${gender}: ${subtype} has no bottom level`));
    onepieces.forEach((subtype) => assert.ok(ONEPIECE_RANGES[subtype], `${gender}: ${subtype} has no range`));
    outers.forEach((subtype) => {
      assert.ok(OUTER_WARMTH_POINTS[subtype] !== undefined, `${gender}: ${subtype} has no warmth points`);
      assert.ok(OUTER_MIN_TEMPS[subtype] !== undefined, `${gender}: ${subtype} has no minimum`);
    });
  });
});

test("every level has a base range for every other level, and every fabric has a warmth", () => {
  [1, 2, 3, 4, 5].forEach((topLevel) => {
    [1, 2, 3, 4, 5].forEach((bottomLevel) => {
      const [min, max] = BASE_RANGES[topLevel][bottomLevel];
      assert.ok(min < max, `${topLevel}/${bottomLevel}`);
    });
  });
  fabrics.forEach((fabric) => assert.equal(typeof fabric.warmth, "number", fabric.name));
});

test("no subtype is in two levels", () => {
  [TOP_LEVELS, BOTTOM_LEVELS].forEach((levels) => {
    const all = Object.values(levels).flat();
    assert.equal(new Set(all).size, all.length);
  });
});

test("top + bottom uses the base range for their levels, floored without an outer", () => {
  const expected = cap(withFloor(BASE_RANGES[1][4], NO_OUTER_MIN_TEMP), JEANS_CAP);
  assert.deepEqual(range([top("Short t-shirt"), bottom(JEANS)]), expected);
});

test("a thin turtleneck jumper is warmer than a fine-knit jumper", () => {
  const [, turtleneckMax] = range([top("Thin turtleneck jumper"), bottom(JEANS)]);
  const [, jumperMax] = range([top("Fine-knit jumper"), bottom(JEANS)]);
  assert.ok(turtleneckMax < jumperMax);
});

test("the warmest top sets the base and every other top adds its layer bonus", () => {
  const expected = widen(cap(
    withFloor(shift(BASE_RANGES[5][4], LAYER_BONUS[1]), NO_OUTER_MIN_TEMP),
    Math.min(LAYERED_MAX_TEMP, JEANS_CAP)
  ));

  // Order doesn't matter.
  assert.deepEqual(range([top("Chunky knit jumper"), top("Short t-shirt"), bottom(JEANS), outer("Puffer coat")]),
    range([top("Short t-shirt"), top("Chunky knit jumper"), bottom(JEANS), outer("Puffer coat")]));
  assert.deepEqual(range([top("Short t-shirt"), top("Chunky knit jumper"), bottom(JEANS)]), expected);
});

test("two tops of the same level: one sets the base, the other adds its bonus", () => {
  const items = [top("Long-sleeve t-shirt"), top("Buttondown shirt"), bottom("Mini skirt")];
  const expected = cap(withFloor(shift(BASE_RANGES[2][1], LAYER_BONUS[2]), NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMP);
  assert.deepEqual(range(items), expected);
});

test("layered tops cap the maximum; a single top doesn't", () => {
  const [, layeredMax] = range([top("Vest"), top("Waistcoat"), bottom("Mini skirt")]);
  const [, singleMax] = range([top("Vest"), bottom("Mini skirt")]);

  assert.equal(layeredMax, LAYERED_MAX_TEMP);
  assert.equal(singleMax, BASE_RANGES[1][1][1]);
});

test("an outer moves the range down by its points, capped at the ceiling and floored at its minimum", () => {
  const points = OUTER_WARMTH_POINTS["Puffer coat"];
  const expected = cap(withFloor(withOuters(BASE_RANGES[1][4], points), OUTER_MIN_TEMPS["Puffer coat"]), JEANS_CAP);

  assert.deepEqual(range([top("Short t-shirt"), bottom(JEANS), outer("Puffer coat")]), expected);
});

test("a light outfit under an outer is widened to the minimum span", () => {
  const [min, max] = BASE_RANGES[1][1];
  const points = OUTER_WARMTH_POINTS["Leather jacket"];
  const cappedMax = Math.min(max - points, OUTER_CEILING_BASE - points);
  assert.ok(min - points > cappedMax - OUTER_MIN_SPAN, "fixture should need widening");

  const expected = withFloor([cappedMax - OUTER_MIN_SPAN, cappedMax], OUTER_MIN_TEMPS["Leather jacket"]);
  assert.deepEqual(range([top("Vest"), bottom("Mini skirt"), outer("Leather jacket")]), expected);
});

test("two outers add their points together and are floored at the lower outer floor", () => {
  const points = OUTER_WARMTH_POINTS["Cropped jacket"] + OUTER_WARMTH_POINTS["Puffer coat"];
  const floor = Math.min(OUTER_MIN_TEMPS["Cropped jacket"], OUTER_MIN_TEMPS["Puffer coat"]);
  const expected = cap(withFloor(withOuters(BASE_RANGES[1][4], points), floor), JEANS_CAP);

  assert.deepEqual(range([top("Short t-shirt"), bottom(JEANS), outer("Cropped jacket"), outer("Puffer coat")]), expected);
});

test("a skirt or dress outfit is never below the skirt/dress floor, even with two outers", () => {
  const skirt = range([top("Long-sleeve t-shirt"), top("Chunky knit jumper"), bottom("Mini skirt"), outer("Tailored blazer"), outer("Classic trench")]);
  const dress = range([onepiece("Winter dress"), top("Chunky knit jumper"), outer("Cropped jacket"), outer("Puffer coat")]);
  const jeans = range([top("Long-sleeve t-shirt"), top("Chunky knit jumper"), bottom(JEANS), outer("Cropped jacket"), outer("Puffer coat")]);

  assert.equal(skirt[0], SKIRT_DRESS_MIN_TEMP);
  assert.equal(dress[0], SKIRT_DRESS_MIN_TEMP);
  assert.ok(jeans[0] < SKIRT_DRESS_MIN_TEMP);
});

test("every skirt/dress subtype is a real bottom or onepiece", () => {
  const bottoms = Object.values(BOTTOM_LEVELS).flat();
  const onepieces = Object.keys(ONEPIECE_RANGES);

  SKIRT_DRESS_SUBTYPES.forEach((subtype) => {
    assert.ok(bottoms.includes(subtype) || onepieces.includes(subtype), subtype);
  });
});

test("a bottom's level caps the maximum, before the preference shift", () => {
  [null, 1, 2, 4, 5].forEach((preference) => {
    const [, max] = range([top("Vest"), bottom(JEANS)], preference);
    assert.equal(max, JEANS_CAP + (TEMPERATURE_PREFERENCE_SHIFT[preference] || 0), `${preference}`);
  });

  const [, woolMax] = range([top("Vest"), bottom("Wool trousers")]);
  assert.ok(woolMax <= BOTTOM_MAX_TEMPS[5]);
});

test("every turtleneck and ski pants are capped by their subtype maximum", () => {
  Object.keys(SUBTYPE_MAX_TEMPS).forEach((subtype) => {
    const isBottom = levelOf(BOTTOM_LEVELS, subtype);
    const items = isBottom
      ? [top("Vest"), bottom(subtype), outer("Puffer coat")]
      : [top(subtype), bottom("Mini skirt")];
    assert.ok(range(items)[1] <= SUBTYPE_MAX_TEMPS[subtype], subtype);
  });

  const [, layeredMax] = range([top("Short turtleneck"), top("Buttondown shirt"), bottom("Mini skirt")]);
  assert.ok(layeredMax <= SUBTYPE_MAX_TEMPS["Short turtleneck"]);
});

test("fabric warmth moves the range, but not an outer's", () => {
  const plain = range([top("Short t-shirt"), bottom("Midi-skirt")]);
  const linen = range([top("Short t-shirt"), bottom("Midi-skirt", "Linen")]);
  const woolCoat = range([top("Short t-shirt"), bottom(JEANS), outer("Wool coat", "Wool / felted")]);
  const plainCoat = range([top("Short t-shirt"), bottom(JEANS), outer("Wool coat")]);

  assert.deepEqual(linen, shift(plain, warmth("Linen")));
  assert.deepEqual(woolCoat, plainCoat);
});

test("the fabric shift is limited either way", () => {
  const items = [top("Vest", "Faux fur"), top("Short t-shirt", "Shearling / fleece"), bottom("Mini skirt", "Faux fur")];
  const expected = cap(withFloor(shift(shift(BASE_RANGES[1][1], LAYER_BONUS[1]), FABRIC_SHIFT_LIMIT), NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMP);
  assert.deepEqual(range(items), expected);
});

test("a fabric the subtype already assumes doesn't count again", () => {
  Object.entries(FABRIC_NAMED_SUBTYPES).forEach(([subtype, fabricNames]) => {
    const isTop = levelOf(TOP_LEVELS, subtype);
    const make = isTop ? top : bottom;
    const other = isTop ? bottom("Mini skirt") : top("Long-sleeve t-shirt");
    const items = isTop ? [top("Vest"), make(subtype)] : [make(subtype)];

    fabricNames.forEach((fabric) => {
      const withFabric = isTop ? [top("Vest"), make(subtype, fabric), other] : [make(subtype, fabric), other];
      assert.deepEqual(range(withFabric), range([...items, other]), `${subtype} / ${fabric}`);
    });
  });
});

test("a onepiece alone uses its own range", () => {
  assert.deepEqual(range([onepiece("Summer dress")]), withFloor(ONEPIECE_RANGES["Summer dress"], NO_OUTER_MIN_TEMP));
});

test("tops with a onepiece use the onepiece layer points and the layered cap", () => {
  const level = levelOf(TOP_LEVELS, "Light cardigan");
  const expected = cap(withFloor(shift(ONEPIECE_RANGES["Summer dress"], ONEPIECE_LAYER_POINTS[level]), NO_OUTER_MIN_TEMP), LAYERED_MAX_TEMP);

  assert.deepEqual(range([onepiece("Summer dress"), top("Light cardigan")]), expected);
});

test("the temperature preference shifts both ends of the saved range", () => {
  const [min, max] = range([top("Short t-shirt"), bottom("Midi-skirt")]);

  [[1, 1], [2, 0.5], [3, 0], [4, -0.5], [5, -1]].forEach(([preference, amount]) => {
    assert.deepEqual(range([top("Short t-shirt"), bottom("Midi-skirt")], preference), [min + amount, max + amount], `${preference}`);
  });
});

test("a narrow range is never widened past a cap - the rest goes below the minimum", () => {
  const [min, max] = range([top("Short turtleneck"), bottom("Mini skirt")]);
  assert.equal(max, SUBTYPE_MAX_TEMPS["Short turtleneck"]);
  assert.equal(max - min, MIN_SPAN);
});

test("a range narrower than the minimum span is widened upwards from its floor", () => {
  const [min, max] = range([top("Chunky knit jumper"), top("Thick turtleneck jumper"), bottom(JEANS)]);
  assert.deepEqual([min, max], [NO_OUTER_MIN_TEMP, NO_OUTER_MIN_TEMP + MIN_SPAN]);
});

test("subtypes with no preset fall back and are reported", () => {
  const { unknownSubtypes } = computePresetTemperatureRange([top("Mystery top"), bottom(JEANS)]);
  assert.deepEqual(unknownSubtypes, ["Mystery top"]);
});
