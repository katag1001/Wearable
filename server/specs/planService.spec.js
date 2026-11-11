const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isPlanDate,
  daysBetween,
  addDays,
  dayStartOf,
  isWithinDay,
  duePlanEntries,
} = require("../services/planService.js");

test("isPlanDate takes real YYYY-MM-DD dates only", () => {
  assert.equal(isPlanDate("2026-11-14"), true);
  assert.equal(isPlanDate("2028-02-29"), true);
  assert.equal(isPlanDate("2026-02-30"), false);
  assert.equal(isPlanDate("2026-1-4"), false);
  assert.equal(isPlanDate("2026-11-14T00:00:00Z"), false);
  assert.equal(isPlanDate(undefined), false);
  assert.equal(isPlanDate(20261114), false);
});

test("daysBetween and addDays count whole days, across months and years", () => {
  assert.equal(daysBetween("2026-11-10", "2026-11-14"), 4);
  assert.equal(daysBetween("2026-11-14", "2026-11-10"), -4);
  assert.equal(daysBetween("2026-12-30", "2027-01-02"), 3);
  assert.equal(addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(addDays("2027-01-02", -3), "2026-12-30");
});

test("dayStartOf counts back from the user's own midnight", () => {
  // Midnight in UTC+1 is 23:00 UTC the day before.
  const todayStart = "2026-11-09T23:00:00.000Z";

  assert.equal(dayStartOf("2026-11-10", "2026-11-10", todayStart).toISOString(), todayStart);
  assert.equal(dayStartOf("2026-11-08", "2026-11-10", todayStart).toISOString(), "2026-11-07T23:00:00.000Z");
});

test("isWithinDay covers the 24 hours from the day's start", () => {
  const dayStart = new Date("2026-11-07T23:00:00.000Z");

  assert.equal(isWithinDay("2026-11-07T23:00:00.000Z", dayStart), true);
  assert.equal(isWithinDay("2026-11-08T22:59:59.000Z", dayStart), true);
  assert.equal(isWithinDay("2026-11-08T23:00:00.000Z", dayStart), false);
  assert.equal(isWithinDay("2026-11-07T22:59:59.000Z", dayStart), false);
  assert.equal(isWithinDay(null, dayStart), false);
});

test("duePlanEntries keeps the plans up to today, oldest first", () => {
  const a = { _id: "a", plannedFor: [{ date: "2026-11-10" }, { date: "2026-11-20" }] };
  const b = { _id: "b", plannedFor: [{ date: "2026-11-08" }] };
  const c = { _id: "c", plannedFor: [] };

  const due = duePlanEntries([a, b, c], "2026-11-10");

  assert.deepEqual(
    due.map(({ match, entry }) => [match._id, entry.date]),
    [["b", "2026-11-08"], ["a", "2026-11-10"]]
  );
});
