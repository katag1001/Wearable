const test = require("node:test");
const assert = require("node:assert/strict");

const {
  planRejection,
  planWear,
  planUnwear,
} = require("../services/footwearScoreService.js");

const TODAY = new Date("2026-10-14T00:00:00Z");
const NOW = new Date("2026-10-14T09:00:00Z");
const YESTERDAY = new Date("2026-10-13T18:00:00Z");

test("planRejection takes 0.1 off a new pairing and dates it", () => {
  assert.deepEqual(planRejection(null, TODAY, 60, NOW), {
    adjustment: -0.1,
    lastRejectedDate: NOW,
  });
});

test("planRejection counts at most once per pairing per day", () => {
  assert.equal(
    planRejection({ adjustment: -0.1, lastRejectedDate: NOW }, TODAY, 60, NOW),
    null
  );

  assert.equal(
    planRejection({ adjustment: -0.1, lastRejectedDate: YESTERDAY }, TODAY, 60, NOW)
      .adjustment,
    -0.2
  );
});

test("planRejection keeps the score from going below 0", () => {
  assert.equal(planRejection({ adjustment: 0 }, TODAY, 0, NOW).adjustment, 0);
});

test("planWear adds 1", () => {
  assert.deepEqual(planWear({ adjustment: 1 }, TODAY, 60), { adjustment: 2 });
});

test("planWear takes back a rejection from the same day", () => {
  assert.deepEqual(
    planWear({ adjustment: -0.1, lastRejectedDate: NOW }, TODAY, 60),
    { adjustment: 1, lastRejectedDate: null }
  );
});

test("planWear keeps the score from going above 100", () => {
  assert.equal(planWear({ adjustment: 10 }, TODAY, 90).adjustment, 10);
});

test("planUnwear takes the worn 1 back off", () => {
  assert.deepEqual(planUnwear({ adjustment: 2 }, 60), { adjustment: 1 });
});
