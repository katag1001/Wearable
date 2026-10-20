const test = require("node:test");
const assert = require("node:assert/strict");

const {
  selectTodayMatches,
  todayTierOf,
} = require("../services/todaySelectionService.js");

const NOW = new Date("2026-10-15T12:00:00Z");
const TODAY = { min: 10, max: 20 };

const match = (id, min_temp, max_temp, fields = {}) => ({
  _id: id,
  min_temp,
  max_temp,
  score: 50,
  tags: [],
  clothes: [],
  lastWornDate: null,
  ...fields,
});

const ids = (matches) => matches.map((entry) => entry._id);

test("outfits covering the whole day come before 70%+ ones", () => {
  const selected = selectTodayMatches({
    matches: [
      match("partial", 12, 25, { score: 100 }), // 8 of 10 degrees
      match("full", 5, 25, { score: 0 }),
    ],
    todayRange: TODAY,
    now: NOW,
  });

  assert.deepEqual(ids(selected), ["full", "partial"]);
});

test("outfits covering less than 70% of the day are left out", () => {
  const selected = selectTodayMatches({
    matches: [match("narrow", 14, 16), match("full", 5, 25)],
    todayRange: TODAY,
    now: NOW,
  });

  assert.deepEqual(ids(selected), ["full"]);
});

test("partial outfits only join while the full ones don't reach the limit", () => {
  const selected = selectTodayMatches({
    matches: [match("full1", 5, 25), match("full2", 0, 30), match("partial", 12, 25)],
    todayRange: TODAY,
    now: NOW,
    limit: 2,
  });

  assert.deepEqual(ids(selected).sort(), ["full1", "full2"]);
});

test("the list is cut to the limit, best first", () => {
  const selected = selectTodayMatches({
    matches: [
      match("a", 5, 25, { score: 10 }),
      match("b", 5, 25, { score: 90 }),
      match("c", 5, 25, { score: 50 }),
    ],
    todayRange: TODAY,
    now: NOW,
    limit: 2,
  });

  assert.deepEqual(ids(selected), ["b", "c"]);
});

test("today's tag orders each tier, but never lifts a partial outfit above a full one", () => {
  const selected = selectTodayMatches({
    matches: [
      match("partial-tagged", 12, 25, { tags: ["Work"] }),
      match("full-untagged", 5, 25),
      match("full-tagged", 5, 25, { tags: ["Work"] }),
    ],
    todayRange: TODAY,
    todayTag: "Work",
    now: NOW,
  });

  assert.deepEqual(ids(selected), ["full-tagged", "full-untagged", "partial-tagged"]);
});

test("outfits within 1.5 degrees of today's min and max, or covering the whole day, are tier 1", () => {
  assert.equal(todayTierOf(match("exact", 10, 20), TODAY), 0);
  assert.equal(todayTierOf(match("edges", 8.5, 21.5), TODAY), 0);
  assert.equal(todayTierOf(match("inside", 11.5, 18.5), TODAY), 0);
  assert.equal(todayTierOf(match("covers", 0, 30), TODAY), 0);
  assert.equal(todayTierOf(match("far", 14, 16), TODAY), null);
});

test("partial outfits are tiered by 90%, 80% and 70% of the day", () => {
  assert.equal(todayTierOf(match("90", 11, 25), TODAY), 1);
  assert.equal(todayTierOf(match("80", 12, 25), TODAY), 2);
  assert.equal(todayTierOf(match("70", 13, 25), TODAY), 3);
  assert.equal(todayTierOf(match("60", 14, 25), TODAY), null);
});

test("close and full-day outfits are ranked together, before partial ones", () => {
  const selected = selectTodayMatches({
    matches: [
      match("partial", 11, 25, { score: 100 }),
      match("full", 5, 25, { score: 100 }),
      match("close", 11, 19, { score: 0 }),
    ],
    todayRange: TODAY,
    now: NOW,
  });

  assert.deepEqual(ids(selected), ["full", "close", "partial"]);
});

test("lower tiers only join while the ones above don't reach the limit", () => {
  const selected = selectTodayMatches({
    matches: [match("partial", 11, 25), match("close1", 10, 20), match("close2", 9, 21)],
    todayRange: TODAY,
    now: NOW,
    limit: 2,
  });

  assert.deepEqual(ids(selected).sort(), ["close1", "close2"]);
});
