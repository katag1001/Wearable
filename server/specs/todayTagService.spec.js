const test = require("node:test");
const assert = require("node:assert/strict");

const { hasEnoughForTag, reorderForTag } = require("../services/todayTagService.js");

const NOW = new Date("2026-10-15T12:00:00Z");
const TODAY_START = new Date("2026-10-15T00:00:00Z");
const NO_JITTER = () => 0.5;

const match = (id, fields = {}) => ({
  _id: id,
  score: 50,
  tags: [],
  clothes: [],
  lastWornDate: null,
  ...fields,
});

const reorder = (matches, todayTag) =>
  reorderForTag({
    matches,
    todayTag,
    scoreOf: (entry) => entry.score,
    todayStart: TODAY_START,
    now: NOW,
    random: NO_JITTER,
  }).map((entry) => entry._id);

/* -------------------- Enough to re-order -------------------- */

test("ten or more outfits with the tag are enough to re-order; nine aren't", () => {
  const party = (count) =>
    Array.from({ length: count }, (_, i) => match(`p${i}`, { tags: ["Party"] }));
  const others = [match("work", { tags: ["Work"] })];

  assert.equal(hasEnoughForTag([...party(10), ...others], "Party"), true);
  assert.equal(hasEnoughForTag([...party(9), ...others], "Party"), false);
});

test("the tag is matched ignoring case", () => {
  const matches = Array.from({ length: 10 }, (_, i) => match(`p${i}`, { tags: ["party"] }));

  assert.equal(hasEnoughForTag(matches, "Party"), true);
});

/* -------------------- The new order -------------------- */

test("outfits with the picked tag come first, each group best first", () => {
  const matches = [
    match("work-best", { tags: ["Work"], score: 90 }),
    match("party-low", { tags: ["Party"], score: 40 }),
    match("other", { score: 60 }),
    match("party-high", { tags: ["Work", "Party"], score: 80 }),
  ];

  assert.deepEqual(reorder(matches, "Party"), ["party-high", "party-low", "work-best", "other"]);
});

test("a higher score beats an outfit that was in the weekly tag's group", () => {
  // Built for Work, "work-party" was ranked above "party" - for Party only
  // the score and freshness count.
  const matches = [
    match("work-party", { tags: ["Work", "Party"], score: 30 }),
    match("party", { tags: ["Party"], score: 90 }),
  ];

  assert.deepEqual(reorder(matches, "Party"), ["party", "work-party"]);
});

test("an outfit worn recently ranks below a fresh one with the same score", () => {
  const matches = [
    match("worn", { tags: ["Party"], lastWornDate: new Date("2026-10-14T12:00:00Z") }),
    match("fresh", { tags: ["Party"] }),
  ];

  assert.deepEqual(reorder(matches, "Party"), ["fresh", "worn"]);
});

test("recently rejected outfits stay out of the top places", () => {
  const rejected = match("rejected", {
    tags: ["Party"],
    score: 100,
    lastRejectedDate: new Date("2026-10-14T12:00:00Z"),
  });
  const rest = Array.from({ length: 10 }, (_, i) =>
    match(`p${i}`, { tags: ["Party"], score: 50 - i })
  );

  assert.equal(reorder([rejected, ...rest], "Party").indexOf("rejected"), 10);
});

test("no outfit is added or dropped", () => {
  const matches = Array.from({ length: 30 }, (_, i) =>
    match(`m${i}`, { tags: i % 3 ? ["Work"] : ["Party"], score: i })
  );

  assert.deepEqual(
    [...reorder(matches, "Party")].sort(),
    matches.map((entry) => entry._id).sort()
  );
});
