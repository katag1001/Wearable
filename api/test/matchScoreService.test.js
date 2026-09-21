const test = require("node:test");
const assert = require("node:assert/strict");

const { pairsForItems } = require("../services/matchScoreService.js");

test("pairsForItems lists every cross-item pair and nothing else, when every item has a distinct subtype", () => {
  const items = [
    { type: "top", subtype: "A" },
    { type: "bottom", subtype: "B" },
    { type: "outer", subtype: "C" },
  ];

  const pairs = pairsForItems(items).map((pair) => pair.join("-"));

  // Standalone-eligibility is no longer score-driven (see
  // api/constants/requiresLayering.js), so no item held alone in its role
  // ever gets a self-pair anymore, regardless of role.
  assert.deepEqual(new Set(pairs), new Set(["A-B", "A-C", "B-C"]));
});

test("pairsForItems still pairs two physically different items that share the same subtype (e.g. two puffer coats)", () => {
  const items = [
    { type: "outer", subtype: "Puffer coat" },
    { type: "outer", subtype: "Puffer coat" },
    { type: "bottom", subtype: "Jeans" },
  ];

  const pairs = pairsForItems(items).map((pair) => pair.join("-"));

  // This is an ordinary cross-item pair (i < j), not a "self-pair for a
  // role held alone" - it exists because two real items share a subtype.
  assert.equal(
    pairs.filter((p) => p === "Puffer coat-Puffer coat").length,
    1
  );
});
