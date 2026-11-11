const test = require("node:test");
const assert = require("node:assert/strict");

const { laterDate, countWear, wornValuesOf } = require("../services/wearService.js");

test("laterDate picks the later date, either may be missing", () => {
  const early = new Date("2026-11-01");
  const late = new Date("2026-11-10");

  assert.equal(laterDate(early, late), late);
  assert.equal(laterDate(late, early), late);
  assert.equal(laterDate(null, early), early);
  assert.equal(laterDate(early, null), early);
  assert.equal(laterDate(null, undefined), null);
});

test("countWear counts a wear and moves the date forward", () => {
  const doc = { lastWornDate: null, timesWorn: 2, timesWornThisYear: 1, wornYear: 2026 };

  countWear(doc, "2026-11-10T08:00:00.000Z");

  assert.equal(doc.timesWorn, 3);
  assert.equal(doc.timesWornThisYear, 2);
  assert.equal(doc.wornYear, 2026);
  assert.equal(doc.lastWornDate.toISOString(), "2026-11-10T08:00:00.000Z");
});

test("countWear starts the year's count again in a new year", () => {
  const doc = { timesWorn: 5, timesWornThisYear: 4, wornYear: 2025 };

  countWear(doc, "2026-01-02T12:00:00.000Z");

  assert.equal(doc.timesWornThisYear, 1);
  assert.equal(doc.wornYear, 2026);
});

test("countWear on an earlier day keeps the more recent lastWornDate", () => {
  const recent = new Date("2026-11-10T08:00:00.000Z");
  const doc = { lastWornDate: recent, timesWorn: 1, timesWornThisYear: 1, wornYear: 2026 };

  countWear(doc, "2026-11-08T12:00:00.000Z");

  assert.equal(doc.lastWornDate, recent);
  assert.equal(doc.timesWorn, 2);
});

test("wornValuesOf copies the wear values with defaults", () => {
  assert.deepEqual(wornValuesOf({}), {
    lastWornDate: null,
    timesWorn: 0,
    timesWornThisYear: 0,
    wornYear: null,
  });
});
