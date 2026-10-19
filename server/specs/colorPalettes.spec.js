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

test("maxColorsByLevel matches the agreed caps: min 4, mid 6, max unlimited", () => {
  assert.equal(maxColorsByLevel.min, 4);
  assert.equal(maxColorsByLevel.mid, 6);
  assert.equal(maxColorsByLevel.max, null);
});

test("getColorRules returns the matching level's palettes and cap together", () => {
  assert.deepEqual(getColorRules("min"), { palettes: colorPalettesByLevel.min, maxColors: 4, level: "min" });
  assert.deepEqual(getColorRules("mid"), { palettes: colorPalettesByLevel.mid, maxColors: 6, level: "mid" });
  assert.deepEqual(getColorRules("max"), { palettes: colorPalettesByLevel.max, maxColors: null, level: "max" });
});

test("getColorRules falls back to the default level for null/unknown input", () => {
  const fallback = getColorRules(null);

  assert.equal(fallback.palettes, colorPalettesByLevel[DEFAULT_COLOUR_LEVEL]);
  assert.equal(fallback.maxColors, maxColorsByLevel[DEFAULT_COLOUR_LEVEL]);
  assert.equal(fallback.level, DEFAULT_COLOUR_LEVEL);

  const unknown = getColorRules("not-a-real-level");

  assert.equal(unknown.palettes, colorPalettesByLevel[DEFAULT_COLOUR_LEVEL]);
  assert.equal(unknown.maxColors, maxColorsByLevel[DEFAULT_COLOUR_LEVEL]);
});

/* -------------------- Palette file -------------------- */

const fs = require("node:fs");
const path = require("node:path");
const {
  allPalettes,
  BRIGHT_COLOURS,
  checkPalettes,
  cleanFavouritePalettes,
} = require("../utils/colorPalettes.js");

// colorOptions lives in an ES module the server can't require, so read the
// names straight from the file.
const colourOptionNames = new Set(
  [...fs.readFileSync(path.join(__dirname, "../../core/constants/optionsBank.js"), "utf8")
    .split("export const colorOptions")[1]
    .split("];")[0]
    .matchAll(/name: "([^"]+)"/g)].map((match) => match[1])
);

test("every palette and bright colour is one the user can pick", () => {
  allPalettes.forEach((palette) => {
    palette.colours.forEach((colour) => assert.ok(colourOptionNames.has(colour), `${palette.id}: ${colour}`));
  });
  BRIGHT_COLOURS.forEach((colour) => assert.ok(colourOptionNames.has(colour), colour));
});

test("the levels only grow: every min palette fits in a mid one, every mid in a max one", () => {
  const fitsIn = (palette, level) =>
    colorPalettesByLevel[level].some((other) => palette.colours.every((c) => other.colours.includes(c)));

  colorPalettesByLevel.min.forEach((palette) => assert.ok(fitsIn(palette, "mid"), palette.id));
  colorPalettesByLevel.mid.forEach((palette) => assert.ok(fitsIn(palette, "max"), palette.id));
});

test("checkPalettes rejects a duplicate id, an unknown tier or level, and a palette with no colours", () => {
  const file = (palette) => ({
    defaultLevel: "mid",
    maxColors: { min: 4, mid: 6, max: null },
    brightColours: [],
    palettes: [{ id: "a", tier: "classic", levels: ["min"], colours: ["Navy"] }, palette],
  });

  assert.doesNotThrow(() => checkPalettes(file({ id: "b", tier: "bold", levels: ["max"], colours: ["Red"] })));
  assert.throws(() => checkPalettes(file({ id: "a", tier: "bold", levels: ["max"], colours: ["Red"] })), /used twice/);
  assert.throws(() => checkPalettes(file({ id: "b", tier: "loud", levels: ["max"], colours: ["Red"] })), /tier/);
  assert.throws(() => checkPalettes(file({ id: "b", tier: "bold", levels: ["huge"], colours: ["Red"] })), /levels/);
  assert.throws(() => checkPalettes(file({ id: "b", tier: "bold", levels: ["max"], colours: [] })), /colour/);
});

test("cleanFavouritePalettes keeps only real palette ids, once each", () => {
  assert.deepEqual(
    cleanFavouritePalettes(["peach-cream-white", "nope", "peach-cream-white"]),
    ["peach-cream-white"]
  );
  assert.deepEqual(cleanFavouritePalettes("peach-cream-white"), []);
  assert.equal(cleanFavouritePalettes(undefined), undefined);
});
