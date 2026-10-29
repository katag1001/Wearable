const test = require("node:test");
const assert = require("node:assert/strict");

const {
  resolveTodayStart,
  wasRejectedSince,
  rejectionCutoff,
  applyRejection,
  undoRejection,
  keepRejectedOutOfTop,
} = require("../services/matchRejectionService.js");

const TODAY_START = new Date("2026-10-07T00:00:00.000Z");
const NOW = new Date("2026-10-07T09:30:00.000Z");

test("resolveTodayStart uses the client's local midnight when it's within a day of now", () => {
  const clientMidnight = "2026-10-06T23:00:00.000Z";

  assert.equal(resolveTodayStart(clientMidnight, NOW).toISOString(), clientMidnight);
});

test("resolveTodayStart falls back to the server's midnight for a missing, invalid or far-off value", () => {
  const serverMidnight = new Date(NOW);
  serverMidnight.setHours(0, 0, 0, 0);

  for (const value of [undefined, "not a date", "2026-09-01T00:00:00.000Z"]) {
    assert.equal(resolveTodayStart(value, NOW).getTime(), serverMidnight.getTime());
  }
});

test("applyRejection counts the rejection and dates it, leaving the score alone", () => {
  const match = { score: 80, rejectedCount: 2, lastRejectedDate: null };

  assert.equal(applyRejection(match, TODAY_START, NOW), true);
  assert.deepEqual(match, { score: 80, rejectedCount: 3, lastRejectedDate: NOW });
});

test("applyRejection counts only once per day", () => {
  const match = { score: 80, rejectedCount: 0, lastRejectedDate: null };

  applyRejection(match, TODAY_START, NOW);

  assert.equal(applyRejection(match, TODAY_START, NOW), false);
  assert.equal(match.rejectedCount, 1);
});

test("applyRejection counts again on a later day", () => {
  const match = {
    score: 2,
    rejectedCount: 1,
    lastRejectedDate: new Date("2026-10-06T18:00:00.000Z"),
  };

  assert.equal(applyRejection(match, TODAY_START, NOW), true);
  assert.equal(match.score, 2);
  assert.equal(match.rejectedCount, 2);
});

test("undoRejection reverses a rejection", () => {
  const match = { score: 80, rejectedCount: 0, lastRejectedDate: null };

  applyRejection(match, TODAY_START, NOW);

  assert.equal(undoRejection(match), true);
  assert.deepEqual(match, { score: 80, rejectedCount: 0, lastRejectedDate: null });
});

test("undoRejection does nothing to an outfit that wasn't rejected", () => {
  const match = { score: 80, rejectedCount: 0, lastRejectedDate: null };

  assert.equal(undoRejection(match), false);
  assert.equal(match.score, 80);
});

test("an outfit is held back for the 3 days after the day it's rejected", () => {
  const cutoff = rejectionCutoff(TODAY_START);

  // Rejected on the 4th: still held back on the 7th.
  assert.equal(wasRejectedSince({ lastRejectedDate: "2026-10-04T20:00:00.000Z" }, cutoff), true);
  // Rejected on the 3rd: back to normal on the 7th.
  assert.equal(wasRejectedSince({ lastRejectedDate: "2026-10-03T20:00:00.000Z" }, cutoff), false);
  assert.equal(wasRejectedSince({ lastRejectedDate: null }, cutoff), false);
});

const RECENT = "2026-10-05T10:00:00.000Z";
const outfit = (id, lastRejectedDate = null) => ({ _id: id, lastRejectedDate });
const idsOf = (matches) => matches.map((match) => match._id);

test("keepRejectedOutOfTop moves recently rejected outfits to just below the top places", () => {
  const ranked = [
    outfit("r1", RECENT),
    outfit("a"),
    outfit("old", "2026-09-20T10:00:00.000Z"),
    outfit("r2", RECENT),
    outfit("b"),
    outfit("c"),
    outfit("r3", RECENT),
  ];

  assert.deepEqual(idsOf(keepRejectedOutOfTop(ranked, TODAY_START, 3)), [
    "a", "old", "b", "r1", "r2", "c", "r3",
  ]);
});

test("keepRejectedOutOfTop keeps every outfit, with the top 10 free of rejected ones", () => {
  const ranked = [
    ...Array.from({ length: 5 }, (_, index) => outfit(`r${index}`, RECENT)),
    ...Array.from({ length: 15 }, (_, index) => outfit(`f${index}`)),
  ];

  const result = keepRejectedOutOfTop(ranked, TODAY_START);

  assert.equal(result.length, ranked.length);
  assert.ok(result.slice(0, 10).every((match) => match.lastRejectedDate === null));
  assert.deepEqual(idsOf(result.slice(10, 15)), ["r0", "r1", "r2", "r3", "r4"]);
});

test("keepRejectedOutOfTop puts rejected outfits straight after the rest when there aren't enough", () => {
  const ranked = [outfit("r1", RECENT), outfit("a"), outfit("r2", RECENT)];

  assert.deepEqual(idsOf(keepRejectedOutOfTop(ranked, TODAY_START)), ["a", "r1", "r2"]);
});

test("applyRejection rejects rated and favourite outfits too, leaving their score alone", () => {
  for (const extra of [{ rating: 4 }, { favourite: true }]) {
    const match = { score: 85, rejectedCount: 0, lastRejectedDate: null, ...extra };

    assert.equal(applyRejection(match, TODAY_START, NOW), true);
    assert.equal(match.score, 85);
    assert.equal(match.rejectedCount, 1);
    assert.equal(match.lastRejectedDate, NOW);
  }
});

test("undoRejection leaves the score alone", () => {
  const match = { score: 70, rating: 3, rejectedCount: 1, lastRejectedDate: NOW };

  assert.equal(undoRejection(match), true);
  assert.deepEqual(match, { score: 70, rating: 3, rejectedCount: 0, lastRejectedDate: null });
});
