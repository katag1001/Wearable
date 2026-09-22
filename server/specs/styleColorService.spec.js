const test = require("node:test");
const assert = require("node:assert/strict");

const { passesPatternCheck, passesColorCheck } = require("../services/styleColorService.js");
const { getColorRules } = require("../utils/colorPalettes.js");

const colorRules = getColorRules("mid");

test("passesPatternCheck allows at most one patterned item", () => {
  assert.equal(
    passesPatternCheck([{ styles: ["patterned"] }, { styles: ["plain"] }]),
    true
  );

  assert.equal(
    passesPatternCheck([{ styles: ["patterned"] }, { styles: ["patterned"] }]),
    false
  );
});

test("passesPatternCheck matches \"Patterned\" case-insensitively, matching how it's actually stored", () => {
  assert.equal(
    passesPatternCheck([{ styles: ["Patterned"] }, { styles: ["Plain"] }]),
    true
  );

  assert.equal(
    passesPatternCheck([{ styles: ["Patterned"] }, { styles: ["Patterned"] }]),
    false
  );
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
    { colors: ["Cream", "Camel", "Tan", "White", "Gold", "Olive Green", "Brown", "Green"] },
  ];

  // 8 distinct colours, all from one real palette - should pass under
  // "max" (no cap) even though it would fail "mid" (cap of 7).
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
