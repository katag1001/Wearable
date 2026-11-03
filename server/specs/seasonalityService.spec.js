const test = require("node:test");
const assert = require("node:assert/strict");

const { seasonalPoints, outfitSeasonFlags, fabricSeasonsOf } = require("../services/seasonalityService.js");
const { todayScoreOf } = require("../services/todayScoreService.js");
const { SEASONALITY_POINTS } = require("../constants/seasonality.js");

const item = (fields) => ({ subtype: "Tee", fabric: "", ...fields });
const palette = (id, colours, seasons) => ({ id, tier: "common", levels: ["mid"], colours, seasons });

const summerPalette = palette("summer-brights", ["Lime Green", "White"], ["summer"]);
const autumnPalette = palette("autumn-deeps", ["Burgundy", "Cream"], ["autumn", "winter"]);
const neutralPalette = palette("neutrals", ["Black", "White", "Cream"], []);
const PALETTES = [summerPalette, autumnPalette, neutralPalette];

const allYear = { min_temp: 5, max_temp: 25 };

/* -------------------- Today's points -------------------- */

test("the seasonality levels give 0, 2, 4, 6 and 8 points", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((level) => SEASONALITY_POINTS[level]), [0, 2, 4, 6, 8]);
});

test("an in-season fabric adds the level's points, once however many items fit", () => {
  const items = [item({ fabric: "Linen" }), item({ fabric: "Crochet / open knit" })];

  assert.equal(seasonalPoints({ items, colours: [], palettes: PALETTES, season: "summer", level: 5 }).fabric, 8);
  assert.equal(seasonalPoints({ items, colours: [], palettes: PALETTES, season: "summer", level: 3 }).fabric, 4);
});

test("an out-of-season fabric takes the points off, and both together cancel out", () => {
  const velvet = [item({ fabric: "Velvet" })];
  const both = [item({ fabric: "Linen" }), item({ fabric: "Velvet" })];

  assert.equal(seasonalPoints({ items: velvet, colours: [], palettes: PALETTES, season: "summer", level: 5 }).fabric, -8);
  assert.equal(seasonalPoints({ items: both, colours: [], palettes: PALETTES, season: "summer", level: 5 }).fabric, 0);
});

test("any-time fabrics, no fabric yet and level 1 add nothing", () => {
  const cotton = [item({ fabric: "Cotton / plain woven" }), item({ fabric: "" })];

  assert.equal(seasonalPoints({ items: cotton, colours: [], palettes: PALETTES, season: "summer", level: 5 }).fabric, 0);
  assert.deepEqual(
    seasonalPoints({ items: [item({ fabric: "Linen" })], colours: [], palettes: PALETTES, season: "summer", level: 1 }),
    { fabric: 0, palette: 0 }
  );
  assert.deepEqual(fabricSeasonsOf(item({ fabric: "Denim" })), []);
});

test("colours fitting an in-season palette add the points; other seasons and neutrals add nothing", () => {
  const points = (colours, season) =>
    seasonalPoints({ items: [], colours, palettes: PALETTES, season, level: 5 }).palette;

  assert.equal(points(["Lime Green", "White"], "summer"), 8);
  assert.equal(points(["Burgundy", "Cream"], "summer"), 0);
  assert.equal(points(["Black", "White"], "summer"), 0);
});

/* -------------------- Today score -------------------- */

test("the Today score adds seasonal points, a favourite item (+7) and a favourite palette (+4) to the saved score", () => {
  const match = {
    score: 80,
    colors: ["Lime Green", "White"],
    clothes: [item({ fabric: "Linen", favourite: true }), item({ fabric: "Cotton / plain woven" })],
  };
  const context = { season: "summer", seasonality: 5, palettes: PALETTES, favouritePalettes: [] };

  assert.equal(todayScoreOf(match, context), 80 + 8 + 8 + 7);
  assert.equal(todayScoreOf({ ...match, clothes: [item({ fabric: "Linen" })] }, context), 80 + 8 + 8);
  assert.equal(todayScoreOf(match, { ...context, season: "winter" }), 80 - 8 + 7);
});

test("a favourite palette adds 4 on Today, at any colour level", () => {
  const match = { score: 70, colors: ["Black", "Bright Red", "White"], clothes: [item({})] };
  const context = { season: "summer", seasonality: 1, palettes: [], favouritePalettes: ["black-red-white"] };

  assert.equal(todayScoreOf(match, context), 74);
});

/* -------------------- Season flags -------------------- */

test("season flags: fabric, season-named types, palettes and temperature bands", () => {
  const flags = (items, colours = [], range = allYear) =>
    outfitSeasonFlags({ items, colours, palettes: PALETTES, range });

  assert.deepEqual(flags([item({})]), { spring: true, summer: true, autumn: true, winter: true });
  assert.deepEqual(flags([item({ fabric: "Linen" })]), { spring: true, summer: true, autumn: false, winter: false });
  assert.deepEqual(flags([item({ subtype: "Winter dress" })]), { spring: false, summer: false, autumn: true, winter: true });
  assert.deepEqual(flags([item({})], ["Lime Green", "White"]), { spring: false, summer: true, autumn: false, winter: false });
  // Fits a neutral palette too, so the colours don't tie it to summer.
  assert.deepEqual(flags([item({})], ["White"]), { spring: true, summer: true, autumn: true, winter: true });
  // Winter is 12°C or below, spring/autumn 8-20°C, summer 18°C or above.
  assert.deepEqual(flags([item({})], [], { min_temp: 21, max_temp: 30 }), { spring: false, summer: true, autumn: false, winter: false });
  assert.deepEqual(flags([item({})], [], { min_temp: 0, max_temp: 7 }), { spring: false, summer: false, autumn: false, winter: true });
});
