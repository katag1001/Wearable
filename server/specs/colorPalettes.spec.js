const test = require("node:test");
const assert = require("node:assert/strict");

const {
  colorPalettesByLevel,
  maxColorsByLevel,
  getColorRules,
  DEFAULT_COLOUR_LEVEL,
} = require("../utils/colorPalettes.js");

test("all three levels exist and are non-empty", () => {
  ["min", "mid", "max"].forEach((level) => {
    assert.ok(Array.isArray(colorPalettesByLevel[level]));
    assert.ok(colorPalettesByLevel[level].length > 0);
  });
});

test("maxColorsByLevel matches the agreed caps: min 4, mid 7, max unlimited", () => {
  assert.equal(maxColorsByLevel.min, 4);
  assert.equal(maxColorsByLevel.mid, 7);
  assert.equal(maxColorsByLevel.max, null);
});

test("getColorRules returns the matching level's palettes and cap together", () => {
  assert.deepEqual(getColorRules("min"), { palettes: colorPalettesByLevel.min, maxColors: 4 });
  assert.deepEqual(getColorRules("mid"), { palettes: colorPalettesByLevel.mid, maxColors: 7 });
  assert.deepEqual(getColorRules("max"), { palettes: colorPalettesByLevel.max, maxColors: null });
});

test("getColorRules falls back to the default level for null/unknown input", () => {
  const fallback = getColorRules(null);

  assert.equal(fallback.palettes, colorPalettesByLevel[DEFAULT_COLOUR_LEVEL]);
  assert.equal(fallback.maxColors, maxColorsByLevel[DEFAULT_COLOUR_LEVEL]);

  const unknown = getColorRules("not-a-real-level");

  assert.equal(unknown.palettes, colorPalettesByLevel[DEFAULT_COLOUR_LEVEL]);
  assert.equal(unknown.maxColors, maxColorsByLevel[DEFAULT_COLOUR_LEVEL]);
});
