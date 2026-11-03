const test = require("node:test");
const assert = require("node:assert/strict");

const {
  selectTodayMatches,
  todayTierOf,
  weatherBandOf,
} = require("../services/todaySelectionService.js");

const NOW = new Date("2026-10-15T12:00:00Z");
const TODAY = { min: 10, max: 20 };
const NO_JITTER = () => 0.5;

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

const ids = (result) => result.matches.map((entry) => entry._id);

const select = (matches, options = {}) =>
  selectTodayMatches({ matches, todayRange: TODAY, now: NOW, random: NO_JITTER, ...options });

/* -------------------- Weather tiers -------------------- */

test("outfits up to 1.5 degrees beyond or 2 inside today's min and max, or covering the whole day, are tier 1", () => {
  assert.equal(todayTierOf(match("exact", 10, 20), TODAY), 0);
  assert.equal(todayTierOf(match("edges", 8.5, 21.5), TODAY), 0);
  assert.equal(todayTierOf(match("inside", 12, 18), TODAY), 0);
  assert.notEqual(todayTierOf(match("too far inside", 12.5, 18), TODAY), 0);
  assert.notEqual(todayTierOf(match("too far outside", 7, 19), TODAY), 0);
  assert.equal(todayTierOf(match("covers", 0, 30), TODAY), 0);
});

test("partial outfits are tiered in 5% steps from 95% down to 50% of the day", () => {
  assert.equal(todayTierOf(match("95", 10.5, 25), TODAY), 1);
  assert.equal(todayTierOf(match("90", 11, 25), TODAY), 2);
  assert.equal(todayTierOf(match("80", 12, 25), TODAY), 4);
  assert.equal(todayTierOf(match("70", 13, 25), TODAY), 6);
  assert.equal(todayTierOf(match("50", 15, 25), TODAY), 10);
  assert.equal(todayTierOf(match("40", 16, 25), TODAY), null);
});

/* -------------------- Who's in the running -------------------- */

test("outfits covering less than 50% of the day are left out", () => {
  assert.deepEqual(ids(select([match("narrow", 14, 16), match("full", 5, 25)])), ["full"]);
});

test("whole tiers join, best first, only until the limit is reached", () => {
  const result = select([match("full1", 5, 25), match("full2", 0, 30), match("partial", 12, 25)], { limit: 2 });

  assert.deepEqual(ids(result).sort(), ["full1", "full2"]);
});

test("a tier joins whole even past the limit - the best of everything in the running is kept", () => {
  const result = select(
    [
      match("full", 5, 25, { score: 10 }),
      match("partial-a", 11, 25, { score: 90 }),
      match("partial-b", 11, 25, { score: 80 }),
    ],
    { limit: 2 }
  );

  assert.deepEqual(ids(result), ["partial-a", "partial-b"]);
});

/* -------------------- Ranking -------------------- */

test("once in the running, the weather tier doesn't decide the order", () => {
  const result = select([match("partial", 12, 25, { score: 100 }), match("full", 5, 25, { score: 0 })]);

  assert.deepEqual(ids(result), ["partial", "full"]);
});

test("outfits are ranked by their Today score when one is given", () => {
  const todayScores = new Map([["a", 60], ["b", 90]]);
  const result = select([match("a", 5, 25, { score: 90 }), match("b", 5, 25, { score: 60 })], {
    scoreOf: (entry) => todayScores.get(entry._id),
  });

  assert.deepEqual(ids(result), ["b", "a"]);
});

test("today's tag comes first across everything in the running", () => {
  const result = select(
    [
      match("partial-tagged", 12, 25, { tags: ["Work"] }),
      match("full-untagged", 5, 25),
      match("full-tagged", 5, 25, { tags: ["Work"] }),
    ],
    { todayTag: "Work" }
  );

  // Both tagged outfits (the partial one too) come before the untagged one.
  assert.deepEqual(ids(result).slice(0, 2).sort(), ["full-tagged", "partial-tagged"]);
  assert.equal(ids(result)[2], "full-untagged");
});

test("the list is cut to the limit, best first", () => {
  const result = select(
    [match("a", 5, 25, { score: 10 }), match("b", 5, 25, { score: 90 }), match("c", 5, 25, { score: 50 })],
    { limit: 2 }
  );

  assert.deepEqual(ids(result), ["b", "c"]);
});

test("outfits sharing an item are spread out", () => {
  const cardi = { clothes: [{ _id: "cardi" }] };
  const result = select([
    match("cardi1", 5, 25, { score: 90, ...cardi }),
    match("cardi2", 5, 25, { score: 80, ...cardi }),
    match("tee", 5, 25, { score: 10, clothes: [{ _id: "tee" }] }),
  ]);

  assert.deepEqual(ids(result), ["cardi1", "tee", "cardi2"]);
});

/* -------------------- Notice -------------------- */

test("no notice when enough outfits fit before the 70% step", () => {
  const result = select([match("full1", 5, 25), match("full2", 0, 30)], { limit: 2 });

  assert.equal(result.notice, null);
});

test("a 'few' notice once the 70% step had to join", () => {
  const result = select([match("full", 5, 25), match("seventy", 13, 25)], { limit: 2 });

  assert.deepEqual(result.notice, { level: "few", band: "mild" });
});

test("a 'shopping' notice when even 50% leaves fewer than the limit - also with nothing at all", () => {
  assert.deepEqual(select([match("full", 5, 25)], { limit: 2 }).notice, { level: "shopping", band: "mild" });

  const cold = selectTodayMatches({ matches: [], todayRange: { min: 2, max: 7 }, now: NOW, limit: 2 });
  assert.deepEqual(cold, { matches: [], notice: { level: "shopping", band: "cold" } });
});

test("the weather band comes from the average of today's min and max", () => {
  assert.equal(weatherBandOf({ min: 2, max: 14 }), "cold");
  assert.equal(weatherBandOf({ min: 10, max: 20 }), "mild");
  assert.equal(weatherBandOf({ min: 18, max: 26 }), "hot");
});

test("every tagged outfit comes before every untagged one, each group by score", () => {
  const result = select(
    [
      match("a", 5, 25, { score: 90, tags: ["Work"] }),
      match("b", 5, 25, { score: 90 }),
      match("c", 5, 25, { score: 80, tags: ["Work"] }),
      match("d", 5, 25, { score: 80 }),
      match("e", 5, 25, { score: 70, tags: ["Work"] }),
      match("f", 5, 25, { score: 70 }),
    ],
    { todayTag: "Work" }
  );

  assert.deepEqual(ids(result), ["a", "c", "e", "b", "d", "f"]);
});

test("the random nudge comes after the cut - it never changes which outfits are kept", () => {
  // 50.2 vs 50: a nudge of up to 0.3 could swap them if it came first.
  const matches = [match("best", 5, 25, { score: 50.2 }), match("next", 5, 25, { score: 50 })];

  for (const random of [() => 0, () => 0.999, () => 0.5]) {
    assert.deepEqual(ids(select(matches, { limit: 1, random })), ["best"]);
  }
});

test("the nudge reorders within a tag group, never across", () => {
  const matches = [
    match("tagged", 5, 25, { score: 50, tags: ["Work"] }),
    match("untagged", 5, 25, { score: 52 }),
  ];
  // Pushes untagged up as far as it goes and tagged down.
  let call = 0;
  const random = () => (call++ % 2 === 0 ? 0 : 0.999);

  assert.deepEqual(ids(select(matches, { todayTag: "Work", random })), ["tagged", "untagged"]);
});
