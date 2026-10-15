const test = require("node:test");
const assert = require("node:assert/strict");

const {
  rankTodayMatches,
  freshness,
} = require("../services/todayRankingService.js");

const NOW = new Date("2026-10-15T12:00:00Z");
const daysAgo = (days) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

const match = (id, fields = {}) => ({
  _id: id,
  score: 50,
  tags: [],
  clothes: [{ lastWornDate: null }],
  lastWornDate: null,
  ...fields,
});

const ids = (matches) => matches.map((entry) => entry._id);

test("freshness is 10 for never worn, 0 for worn now, and full again after 30 days", () => {
  assert.equal(freshness(null, NOW), 10);
  assert.equal(freshness(NOW, NOW), 0);
  assert.equal(freshness(daysAgo(15), NOW), 5);
  assert.equal(freshness(daysAgo(60), NOW), 10);
});

test("outfits with today's tag come before the rest, whatever their score", () => {
  const ranked = rankTodayMatches(
    [
      match("untagged", { score: 100 }),
      match("tagged", { score: 0, tags: ["Work"] }),
    ],
    "work",
    NOW
  );

  assert.deepEqual(ids(ranked), ["tagged", "untagged"]);
});

test("with no tag for today, every outfit is ranked together", () => {
  const ranked = rankTodayMatches(
    [match("low", { score: 10 }), match("high", { score: 90 })],
    null,
    NOW
  );

  assert.deepEqual(ids(ranked), ["high", "low"]);
});

test("recently worn outfits and clothes rank lower", () => {
  const ranked = rankTodayMatches(
    [
      match("worn", { lastWornDate: daysAgo(1), clothes: [{ lastWornDate: daysAgo(1) }] }),
      match("fresh"),
    ],
    null,
    NOW
  );

  assert.deepEqual(ids(ranked), ["fresh", "worn"]);
});

test("a favourite counts as the top score", () => {
  const ranked = rankTodayMatches(
    [match("high", { score: 95 }), match("favourite", { score: 10, favourite: true })],
    null,
    NOW
  );

  assert.deepEqual(ids(ranked), ["favourite", "high"]);
});
