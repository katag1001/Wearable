const test = require("node:test");
const assert = require("node:assert/strict");

const {
  resolveTodayStart,
  wasRejectedSince,
  rejectionCutoff,
  applyRejection,
  undoRejection,
  excludeRecentlyRejected,
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

test("applyRejection counts the rejection, dates it and takes 3 off the score", () => {
  const match = { score: 80, rejectedCount: 2, lastRejectedDate: null };

  assert.equal(applyRejection(match, TODAY_START, NOW), true);
  assert.deepEqual(match, { score: 77, rejectedCount: 3, lastRejectedDate: NOW });
});

test("applyRejection counts only once per day", () => {
  const match = { score: 80, rejectedCount: 0, lastRejectedDate: null };

  applyRejection(match, TODAY_START, NOW);

  assert.equal(applyRejection(match, TODAY_START, NOW), false);
  assert.equal(match.score, 77);
  assert.equal(match.rejectedCount, 1);
});

test("applyRejection counts again on a later day, and never takes the score below 0", () => {
  const match = {
    score: 2,
    rejectedCount: 1,
    lastRejectedDate: new Date("2026-10-06T18:00:00.000Z"),
  };

  assert.equal(applyRejection(match, TODAY_START, NOW), true);
  assert.equal(match.score, 0);
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

test("an outfit is hidden for the 5 days after the day it's rejected", () => {
  const cutoff = rejectionCutoff(TODAY_START);

  // Rejected on the 2nd: still hidden on the 7th.
  assert.equal(wasRejectedSince({ lastRejectedDate: "2026-10-02T20:00:00.000Z" }, cutoff), true);
  // Rejected on the 1st: back on the 7th.
  assert.equal(wasRejectedSince({ lastRejectedDate: "2026-10-01T20:00:00.000Z" }, cutoff), false);
  assert.equal(wasRejectedSince({ lastRejectedDate: null }, cutoff), false);
});

test("excludeRecentlyRejected drops recently rejected outfits", () => {
  const fresh = { _id: "a", lastRejectedDate: null };
  const old = { _id: "b", lastRejectedDate: "2026-09-20T10:00:00.000Z" };
  const recent = { _id: "c", lastRejectedDate: "2026-10-05T10:00:00.000Z" };

  assert.deepEqual(excludeRecentlyRejected([fresh, old, recent], TODAY_START), [fresh, old]);
});

test("excludeRecentlyRejected falls back to every outfit when all were rejected recently", () => {
  const matches = [
    { _id: "a", lastRejectedDate: "2026-10-05T10:00:00.000Z" },
    { _id: "b", lastRejectedDate: "2026-10-06T10:00:00.000Z" },
  ];

  assert.deepEqual(excludeRecentlyRejected(matches, TODAY_START), matches);
});
