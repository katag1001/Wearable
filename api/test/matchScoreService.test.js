const test = require("node:test");
const assert = require("node:assert/strict");

const { pairsForItems } = require("../services/matchScoreService.js");

test("pairsForItems lists every cross-item pair, plus a self-pair for each role held alone", () => {
  const items = [
    { type: "top", subtype: "A" },
    { type: "bottom", subtype: "B" },
    { type: "outer", subtype: "C" },
  ];

  const pairs = pairsForItems(items).map((pair) => pair.join("-"));

  // All three roles are occupied alone here, so each also gets a self-pair.
  assert.deepEqual(
    new Set(pairs),
    new Set(["A-B", "A-C", "B-C", "A-A", "B-B", "C-C"])
  );
});

test("pairsForItems adds a self-pair only for a role occupied alone", () => {
  const items = [
    { type: "top", subtype: "A" },
    { type: "top", subtype: "B" },
    { type: "bottom", subtype: "C" },
  ];

  const pairs = pairsForItems(items).map((pair) => pair.join("-"));

  // Bottom "C" is alone in its role, so it gets a self-pair.
  // The two tops are not alone, so neither gets a self-pair.
  assert.deepEqual(
    new Set(pairs),
    new Set(["A-B", "A-C", "B-C", "C-C"])
  );
});
