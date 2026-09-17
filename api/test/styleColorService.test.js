const test = require("node:test");
const assert = require("node:assert/strict");

const { passesPatternCheck, passesColorCheck } = require("../services/styleColorService.js");

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

  assert.equal(passesColorCheck(items), true);
});

test("passesColorCheck fails when no single palette covers every colour", () => {
  const items = [{ colors: ["Cream"] }, { colors: ["Neon Green"] }];

  assert.equal(passesColorCheck(items), false);
});
