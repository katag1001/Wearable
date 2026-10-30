const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isPatterned,
  patternFailure,
  passesPatternCheck,
  passesColorCheck,
} = require("../services/styleColorService.js");
const { getColorRules } = require("../utils/colorPalettes.js");

const colorRules = getColorRules("mid");

const worn = (...patterns) => patterns.map((pattern) => ({ pattern }));

test("isPatterned is anything but Plain, and an item with no pattern counts as plain", () => {
  assert.equal(isPatterned({ pattern: "Stripe" }), true);
  assert.equal(isPatterned({ pattern: "Plain" }), false);
  assert.equal(isPatterned({}), false);
});

test("at min, a second patterned item fails whatever the patterns", () => {
  assert.equal(passesPatternCheck(worn("Stripe", "Plain", "Plain"), "min"), true);
  assert.equal(passesPatternCheck(worn("Stripe", "Floral"), "min"), false);
  assert.equal(passesPatternCheck(worn("Lace/broderie", "Lace/broderie"), "min"), false);
});

test("at mid and max, two patterns pass but three don't", () => {
  ["mid", "max"].forEach((level) => {
    assert.equal(passesPatternCheck(worn("Stripe", "Floral"), level), true);
    assert.equal(passesPatternCheck(worn("Stripe", "Floral", "Spots/dots"), level), false);
  });
});

test("the same pattern twice fails, except Lace/broderie", () => {
  assert.equal(passesPatternCheck(worn("Stripe", "Stripe"), "max"), false);
  assert.equal(passesPatternCheck(worn("Lace/broderie", "Lace/broderie"), "mid"), true);
});

test("a graphic print never goes with another pattern", () => {
  assert.equal(passesPatternCheck(worn("Graphic/slogan", "Stripe"), "max"), false);
  assert.equal(passesPatternCheck(worn("Graphic/slogan", "Plain"), "min"), true);
});

test("two bold patterns fail below max", () => {
  assert.equal(passesPatternCheck(worn("Floral", "Animal print"), "mid"), false);
  assert.equal(passesPatternCheck(worn("Floral", "Animal print"), "max"), true);
});

test("patternFailure says why, and defaults to the mid level", () => {
  assert.equal(patternFailure(worn("Stripe", "Floral"), "min"), "more than 1 patterned item");
  assert.equal(patternFailure(worn("Stripe", "Floral")), null);
});

test("passesColorCheck passes when all combined colours fit one shared palette", () => {
  const items = [{ colors: ["Cream", "Tan"] }, { colors: ["White"] }];

  assert.equal(passesColorCheck(items, colorRules), true);
});

test("passesColorCheck fails when no single palette covers every colour", () => {
  const items = [{ colors: ["Cream"] }, { colors: ["Neon Green"] }];

  assert.equal(passesColorCheck(items, colorRules), false);
});

test("passesColorCheck fails when the distinct colour count exceeds the level's cap, even though they'd fit a palette", () => {
  // These 8 colours are all present in one real palette (verified below via
  // the "max" test, which has no cap) - "mid" still rejects it purely for
  // having more than 7 distinct colours.
  const items = [
    { colors: ["Cream", "Camel", "Tan", "White"] },
    { colors: ["Gold", "Olive Green", "Brown", "Green"] },
  ];

  assert.equal(passesColorCheck(items, colorRules), false);
});

test("passesColorCheck: 'max' level has no colour-count cap", () => {
  const maxRules = getColorRules("max");

  const items = [
    { colors: ["Cream", "Camel", "Tan", "White", "Gold", "Olive Green", "Brown", "Peach"] },
  ];

  // 8 distinct colours, all from one real palette - should pass under
  // "max" (no cap) even though it would fail "mid" (cap of 6).
  assert.equal(passesColorCheck(items, maxRules), true);
  assert.equal(passesColorCheck(items, colorRules), false);
});

test("passesColorCheck: 'min' level caps at 4 distinct colours", () => {
  const minRules = getColorRules("min");

  const withinCap = [{ colors: ["Cream", "Camel", "Tan", "White"] }];
  assert.equal(passesColorCheck(withinCap, minRules), true);

  const overCap = [{ colors: ["Cream", "Camel", "Tan", "White", "Gold"] }];
  assert.equal(passesColorCheck(overCap, minRules), false);
});
