const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const { Match } = require("../models/AllModels.js");
const { msUntilDeadline } = require("../utils/functionDeadline.js");

test("a match's clothesKey is set from its clothes, in sorted order", async () => {
  const [a, b] = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  const match = new Match({ clothes: [b, a] });

  await match.validate().catch(() => {});

  assert.equal(match.clothesKey, [a, b].map(String).sort().join(","));
});

test("outside Vercel there's no function deadline", () => {
  assert.equal(msUntilDeadline(), Infinity);
});
