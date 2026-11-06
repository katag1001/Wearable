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

const {
  allPalettes,
  BRIGHT_COLOURS,
  checkPalettes,
  cleanFavouriteColourFamilies,
  favouriteFamilyPalettes,
  fitsFavouriteColours,
} = require("../utils/colorPalettes.js");

// The colours the user can pick (core's colorOptions reads the same file).
const colourOptionNames = new Set(require("../../shared/colors.json").map(({ name }) => name));

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

test("checkPalettes rejects a duplicate id, an unknown tier, level or season, and a palette with no colours", () => {
  const file = (palette) => ({
    defaultLevel: "mid",
    maxColors: { min: 4, mid: 6, max: null },
    brightColours: [],
    neutralColours: ["White"],
    colourFamilies: [{ id: "blues", name: "Blues", colours: ["Navy"] }, { id: "reds", name: "Reds", colours: ["Red"] }],
    palettes: [{ id: "a", tier: "classic", levels: ["min"], colours: ["Navy"], seasons: [] }, palette],
  });
  const palette = (fields) => ({ id: "b", tier: "bold", levels: ["max"], colours: ["Red"], seasons: ["summer"], ...fields });

  assert.doesNotThrow(() => checkPalettes(file(palette({}))));
  assert.throws(() => checkPalettes(file(palette({ id: "a" }))), /used twice/);
  assert.throws(() => checkPalettes(file(palette({ tier: "loud" }))), /tier/);
  assert.throws(() => checkPalettes(file(palette({ levels: ["huge"] }))), /levels/);
  assert.throws(() => checkPalettes(file(palette({ colours: [] }))), /colour/);
  assert.throws(() => checkPalettes(file(palette({ seasons: ["monsoon"] }))), /seasons/);
  assert.throws(() => checkPalettes(file(palette({ seasons: undefined }))), /seasons/);
  assert.throws(() => checkPalettes(file(palette({ colours: ["Red", "Pink"] }))), /neither a neutral nor in a colour family/);
});

test("checkPalettes rejects a colour that is in two families, or both a neutral and in a family", () => {
  const file = (colourFamilies) => ({
    defaultLevel: "mid",
    maxColors: { min: 4, mid: 6, max: null },
    brightColours: [],
    neutralColours: ["White"],
    colourFamilies,
    palettes: [],
  });

  assert.throws(
    () => checkPalettes(file([{ id: "a", name: "A", colours: ["Navy"] }, { id: "b", name: "B", colours: ["Navy"] }])),
    /another family/
  );
  assert.throws(() => checkPalettes(file([{ id: "a", name: "A", colours: ["White"] }])), /neutral/);
  assert.throws(() => checkPalettes(file([{ id: "a", name: "A", colours: ["Navy"] }, { id: "a", name: "B", colours: ["Red"] }])), /id of its own/);
});

test("cleanFavouriteColourFamilies keeps only real family ids, once each, at most 3", () => {
  assert.deepEqual(cleanFavouriteColourFamilies(["blues", "nope", "blues"]), ["blues"]);
  assert.deepEqual(cleanFavouriteColourFamilies(["blues", "reds", "pinks", "greens"]), ["blues", "reds", "pinks"]);
  assert.deepEqual(cleanFavouriteColourFamilies("blues"), []);
  assert.equal(cleanFavouriteColourFamilies(undefined), undefined);
});

test("a palette is a favourite only if every family in it was picked", () => {
  const ids = (familyIds) => favouriteFamilyPalettes(familyIds).map((palette) => palette.id);

  // Light blue / dark blue / silver / white: Blues only.
  assert.ok(ids(["blues"]).includes("light-blue-dark-blue-silver"));
  // Navy / orange / white: Blues and Warm brights.
  assert.ok(!ids(["blues"]).includes("navy-orange-white"));
  assert.ok(ids(["blues", "warm-brights"]).includes("navy-orange-white"));
  assert.deepEqual(ids([]), []);
});

test("favourite colours need at least one non-neutral colour in a favourite palette", () => {
  const palettes = favouriteFamilyPalettes(["blues"]);

  assert.ok(fitsFavouriteColours(["Light Blue", "White"], palettes));
  assert.ok(!fitsFavouriteColours(["Light Blue", "Orange"], palettes));
  // All neutral: fits a palette, but isn't anyone's favourite colours.
  assert.ok(!fitsFavouriteColours(["Black", "White"], palettes));
  assert.ok(!fitsFavouriteColours(["Light Blue"], []));
});
