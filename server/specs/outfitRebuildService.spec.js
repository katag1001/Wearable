const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const { replacedOutfitsFilter, rebuildStatus } = require("../services/outfitRebuildService.js");
const { UNPROTECTED_MATCH_FILTER } = require("../services/matchProtection.js");

const startedAt = new Date("2026-11-07T10:00:00Z");

test("the replaced outfits are unprotected ones saved before the rebuild started", () => {
  const filter = replacedOutfitsFilter("user1", { allItems: true, startedAt });

  Object.entries(UNPROTECTED_MATCH_FILTER).forEach(([field, value]) => {
    assert.deepEqual(filter[field], value);
  });
  assert.equal(filter.userId, "user1");
  assert.equal(filter._id.$lt.getTimestamp().getTime(), startedAt.getTime());
  assert.equal(filter.clothes, undefined);
});

test("a partial rebuild only replaces outfits with an item in scope", () => {
  const scopeItemIds = [new mongoose.Types.ObjectId()];
  const filter = replacedOutfitsFilter("user1", { allItems: false, scopeItemIds, startedAt });

  assert.deepEqual(filter.clothes, { $in: scopeItemIds });
});

test("an outfit saved after the rebuild started isn't replaced", () => {
  const filter = replacedOutfitsFilter("user1", { allItems: true, startedAt });
  const later = mongoose.Types.ObjectId.createFromTime(startedAt.getTime() / 1000 + 5);
  const earlier = mongoose.Types.ObjectId.createFromTime(startedAt.getTime() / 1000 - 5);

  assert.ok(earlier.toString() < filter._id.$lt.toString());
  assert.ok(later.toString() > filter._id.$lt.toString());
});

test("the status reports what's left", () => {
  assert.deepEqual(rebuildStatus(null), { running: false, remaining: 0, total: 0 });
  assert.deepEqual(rebuildStatus({ remainingItemIds: ["a", "b"], total: 5 }), {
    running: true,
    remaining: 2,
    total: 5,
  });
});
