const test = require("node:test");
const assert = require("node:assert/strict");

const {
  checkTrend,
  activeTrends,
  trendsOn,
  trendPoints,
  showsTrendNote,
} = require("../services/trendService.js");
const { todayScoreBreakdown, trendNoteOf } = require("../services/todayScoreService.js");

const item = (fields) => ({ subtype: "Short t-shirt", colors: [], pattern: "Plain", fabric: "", ...fields });
const piece = (fields) => ({ subtype: [], colour: [], pattern: [], fabric: [], ...fields });

const flares = {
  label: "Long-sleeve tops with flared jeans",
  plural: true,
  pieces: [piece({ subtype: ["Long-sleeve t-shirt"] }), piece({ subtype: ["Flared jeans", "Flared trousers"] })],
};
const whiteJeans = {
  label: "White jeans",
  plural: true,
  pieces: [piece({ subtype: ["Jeans", "Flared jeans"], colour: ["White"] })],
};
const burgundy = { label: "Burgundy", pieces: [piece({ colour: ["Burgundy"] })] };

/* -------------------- Checking -------------------- */

test("a trend with no end date ends 3 months after it's added", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  const { trend } = checkTrend(flares, now);

  assert.equal(trend.until.toISOString(), "2027-02-06T12:00:00.000Z");
  assert.equal(trend.added, now);
  assert.equal(trend.plural, true);
});

test("unknown names, empty pieces and past end dates are refused", () => {
  assert.match(checkTrend({ label: "x", pieces: [piece({ colour: ["Burgandy"] })] }).error, /Burgandy/);
  assert.ok(checkTrend({ label: "x", pieces: [piece({})] }).error);
  assert.ok(checkTrend({ label: "", pieces: [piece({ colour: ["White"] })] }).error);
  assert.ok(checkTrend({ label: "x", pieces: [] }).error);
  assert.ok(checkTrend({ label: "x", pieces: [piece({ colour: ["White"] })], until: "2000-01-01" }).error);
});

test("ended trends don't count", () => {
  const now = new Date("2026-11-06");
  const trends = [
    { label: "old", until: new Date("2026-10-01") },
    { label: "new", until: new Date("2027-01-01") },
  ];

  assert.deepEqual(activeTrends(trends, now).map((trend) => trend.label), ["new"]);
});

/* -------------------- Matching -------------------- */

test("a combination needs each piece on a different item", () => {
  const outfit = [item({ subtype: "Long-sleeve t-shirt" }), item({ subtype: "Flared jeans" })];

  assert.deepEqual(trendsOn(outfit, [flares]), [flares]);
  assert.deepEqual(trendsOn([item({ subtype: "Long-sleeve t-shirt" })], [flares]), []);
});

test("an item's colour, and a colour anywhere", () => {
  const outfit = [item({ subtype: "Jeans", colors: ["White"] }), item({ colors: ["Burgundy", "Black"] })];

  assert.deepEqual(trendsOn(outfit, [whiteJeans, burgundy]), [whiteJeans, burgundy]);
  assert.deepEqual(trendsOn([item({ subtype: "Jeans", colors: ["Navy"] })], [whiteJeans]), []);
});

/* -------------------- Points -------------------- */

test("trend points by level, capped for two or more trends", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((level) => trendPoints(1, level)), [0, 0, 1, 3, 6]);
  assert.deepEqual([1, 2, 3, 4, 5].map((level) => trendPoints(2, level)), [0, 0, 1, 6, 8]);
  assert.equal(trendPoints(3, 5), 8);
  assert.equal(trendPoints(0, 5), 0);
  assert.equal(trendPoints(1, null), 0);
});

test("the Today score adds trend points, and only 4-5 get the note", () => {
  const match = { score: 70, colors: ["Burgundy"], clothes: [item({ colors: ["Burgundy"] })] };
  const context = { season: "summer", seasonality: 1, palettes: [], trends: [burgundy], trendsLevel: 5 };

  assert.equal(todayScoreBreakdown(match, context).trend, 6);
  assert.equal(todayScoreBreakdown(match, context).total, 76);
  assert.deepEqual(trendNoteOf(match, context), { label: "Burgundy", plural: false });
  assert.equal(trendNoteOf(match, { ...context, trendsLevel: 3 }), null);
  assert.equal(showsTrendNote(4), true);
});

test("a trend can be limited to some genders", () => {
  const { trendsForGender } = require("../services/trendService.js");
  const forWomen = { ...burgundy, genders: ["woman", "unisex"] };
  const forAll = { ...whiteJeans, genders: [] };

  assert.deepEqual(trendsForGender([forWomen, forAll], "man"), [forAll]);
  assert.deepEqual(trendsForGender([forWomen, forAll], "woman"), [forWomen, forAll]);
  assert.deepEqual(checkTrend({ ...burgundy, genders: ["woman"] }).trend.genders, ["woman"]);
  assert.match(checkTrend({ ...burgundy, genders: ["women"] }).error, /women/);
});

test("an end date picked on the page runs to the end of that day", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  const { trend } = checkTrend({ ...burgundy, until: "2026-11-06" }, now);

  assert.equal(trend.until.toISOString(), "2026-11-06T23:59:59.999Z");
});

test("a shoe trend is one shoe piece, and never matches clothing", () => {
  const { isShoeTrend } = require("../services/trendService.js");
  const { trend } = checkTrend({
    label: "Burgundy loafers",
    plural: true,
    pieces: [piece({ footwear: ["Loafers"], colour: ["Burgundy"] })],
  });

  assert.equal(isShoeTrend(trend), true);
  assert.deepEqual(trendsOn([item({ colors: ["Burgundy"] })], [trend]), []);
  assert.ok(checkTrend({ label: "x", pieces: [piece({ footwear: ["Loafers"], subtype: ["Jeans"] })] }).error);
  assert.ok(
    checkTrend({ label: "x", pieces: [piece({ footwear: ["Loafers"] }), piece({ colour: ["White"] })] }).error
  );
});
