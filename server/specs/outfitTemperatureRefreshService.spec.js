const test = require("node:test");
const assert = require("node:assert/strict");

const { planTemperatureRefresh } = require("../services/outfitTemperatureRefreshService.js");
const { describeOutfit } = require("../services/outfitEvaluator.js");
const { getColorRules } = require("../utils/colorPalettes.js");

const tee = { _id: "tee", type: "top", subtype: "Short t-shirt", colors: ["White"], pattern: "Plain", tags: ["Everyday"], fabric: "" };
const jeans = { _id: "jeans", type: "bottom", subtype: "Straight leg jeans", colors: ["Navy"], pattern: "Plain", tags: ["Everyday"], fabric: "" };

const itemsById = new Map([tee, jeans].map((item) => [item._id, item]));

const context = (temperaturePreference) => ({
  gender: "woman",
  colorRules: getColorRules(null),
  temperaturePreference,
});

// The outfit as saved under a temperature preference.
const savedUnder = (temperaturePreference, overrides = {}) => {
  const { min_temp, max_temp, spring, summer, autumn, winter } = describeOutfit([tee, jeans], {
    isUserMade: true,
    temperaturePreference,
    gender: "woman",
    colorRules: getColorRules(null),
  });

  return { _id: "outfit", clothes: ["tee", "jeans"], min_temp, max_temp, spring, summer, autumn, winter, ...overrides };
};

test("an outfit saved under the same preference needs no update", () => {
  assert.deepEqual(planTemperatureRefresh([savedUnder(3)], itemsById, context(3)), []);
});

test("a new preference shifts the saved range", () => {
  const [update] = planTemperatureRefresh([savedUnder(3)], itemsById, context(1));
  const before = savedUnder(3);

  // 1 = always too cold: the range moves up a degree.
  assert.equal(update._id, "outfit");
  assert.equal(update.fields.min_temp, before.min_temp + 1);
  assert.equal(update.fields.max_temp, before.max_temp + 1);
});

test("only the range and season fields are updated", () => {
  const [update] = planTemperatureRefresh([savedUnder(3)], itemsById, context(5));

  Object.keys(update.fields).forEach((field) => {
    assert.ok(["min_temp", "max_temp", "spring", "summer", "autumn", "winter"].includes(field), field);
  });
});

test("an outfit with an item missing is left alone", () => {
  const outfit = savedUnder(3, { clothes: ["tee", "gone"] });

  assert.deepEqual(planTemperatureRefresh([outfit], itemsById, context(1)), []);
});
