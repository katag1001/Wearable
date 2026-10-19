const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildRolePools,
  buildMatchingContext,
  createBudget,
  findShapeCombinations,
  findCandidateMatches,
  isStillViable,
  dedupeKey,
  isOnlyDuplicateKeyErrors,
  scoreItemSet,
  pairsWithAll,
} = require("../services/matchService.js");
const { MIN_AUTO_SCORE, MIN_PAIR_SCORE, SINGLE_ITEM_SCORE } = require("../constants/scoring.js");
const { OUTFIT_SHAPES } = require("../constants/outfitShapes.js");
const { getColorRules } = require("../utils/colorPalettes.js");

function clothes(overrides) {
  return {
    _id: overrides.subtype,
    colors: ["Cream"],
    styles: ["plain"],
    tags: ["Everyday"],
    spring: true,
    summer: true,
    autumn: true,
    winter: true,
    userId: "user1",
    ...overrides,
  };
}

// Every pair of different subtypes scores `score` (default above
// MIN_AUTO_SCORE, so outfits are kept); the same subtype is null.
function openBaseline(subtypes, score = 70) {
  const matrix = {};
  subtypes.forEach((a) => {
    matrix[a] = {};
    subtypes.forEach((b) => {
      matrix[a][b] = a === b ? null : score;
    });
  });
  return matrix;
}

function context(baselineMatrix, overrides = {}) {
  return {
    baselineMatrix,
    adjustments: new Map(),
    layeringRules: { requiresLayeringSet: new Set(), requiresTopSet: new Set() },
    colorRules: getColorRules(null),
    temperaturePreference: null,
    ...overrides,
  };
}

// One made-up "mid" palette of the given tier, so scores don't depend on
// the real palette file. At mid, common scores 85 and bold 65; 1 colour
// scores 65 and 2 colours 55. So 1 Cream item in a common palette has a
// colour score of (65 + 85) / 2 = 75.
function testColourRules(tier = "common") {
  return {
    palettes: [{ id: "test", tier, levels: ["mid"], colours: ["Cream", "Camel", "Tan"] }],
    maxColors: 6,
    level: "mid",
  };
}

function scoringContext(baselineMatrix, tier) {
  return context(baselineMatrix, { colorRules: testColourRules(tier) });
}

const topBottomShape = OUTFIT_SHAPES.find((s) => s.top === 1 && s.bottom === 1 && s.outer === 0);
const twoTopShape = OUTFIT_SHAPES.find((s) => s.top === 2 && s.bottom === 1 && s.outer === 0);

test("buildRolePools groups wardrobe items by type and excludes the new item", () => {
  const newItem = clothes({ subtype: "NewTop", type: "top" });

  const pools = buildRolePools(
    [newItem, clothes({ subtype: "Jeans", type: "bottom" }), clothes({ subtype: "Blazer", type: "outer" })],
    newItem
  );

  assert.equal(pools.top.length, 0);
  assert.equal(pools.bottom.length, 1);
  assert.equal(pools.outer.length, 1);
});

test("buildMatchingContext resolves one gender's matrix and layering rules", () => {
  const built = buildMatchingContext({ gender: "man" });

  assert.equal(typeof built.baselineMatrix["Short t-shirt"], "object");
  assert.equal(built.layeringRules.requiresLayeringSet.has("Waistcoat"), true);
  assert.equal(built.layeringRules.requiresTopSet.has("Overalls"), true);
});

test("findShapeCombinations finds a top+bottom pair when they're compatible", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });
  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };

  const results = findShapeCombinations(
    newTop, topBottomShape, pools, context(openBaseline(["Short t-shirt", "Jeans"])), createBudget()
  );

  assert.equal(results.length, 1);
});

test("findShapeCombinations finds nothing when the matrix says the pair never matches", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const linen = clothes({ subtype: "Linen shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const baseline = openBaseline(["Short t-shirt", "Linen shirt", "Jeans"]);
  baseline["Short t-shirt"]["Linen shirt"] = null;
  baseline["Linen shirt"]["Short t-shirt"] = null;

  const pools = { top: [linen], bottom: [jeans], onepiece: [], outer: [] };

  const results = findShapeCombinations(newTop, twoTopShape, pools, context(baseline), createBudget());

  assert.equal(results.length, 0);
});

test("two items of the same subtype are never put in the same outfit", () => {
  const tshirtA = clothes({ _id: "physical-1", subtype: "Short t-shirt", type: "top" });
  const tshirtB = clothes({ _id: "physical-2", subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ _id: "physical-3", subtype: "Jeans", type: "bottom" });

  const results = findCandidateMatches(
    tshirtA, [tshirtA, tshirtB, jeans], context(openBaseline(["Short t-shirt", "Jeans"]))
  );

  assert.equal(results.find((r) => r.topCount === 2), undefined);
  assert.equal(results.length, 1);
});

test("findCandidateMatches attaches the outfit's score to every match", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  // Pair 70, colour 75: 0.6 * 70 + 0.4 * 75 = 72
  const results = findCandidateMatches(newTop, [newTop, jeans], scoringContext(openBaseline(["Short t-shirt", "Jeans"], 70)));

  assert.equal(results.length, 1);
  assert.equal(results[0].score, 72);
  assert.equal(results[0].userMade, false);
});

test("findCandidateMatches keeps only the best `limit` outfits, highest score first", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const bottoms = ["Jeans", "Chinos", "Cargo pants"].map((subtype) => clothes({ subtype, type: "bottom" }));

  const baseline = openBaseline(["Short t-shirt", "Jeans", "Chinos", "Cargo pants"]);
  [["Jeans", 90], ["Chinos", 80], ["Cargo pants", 70]].forEach(([subtype, score]) => {
    baseline["Short t-shirt"][subtype] = score;
    baseline[subtype]["Short t-shirt"] = score;
  });

  const results = findCandidateMatches(newTop, [newTop, ...bottoms], scoringContext(baseline), { limit: 2 });

  // Pairs 90 and 80, colour 75: 0.6 * pair + 0.4 * 75
  assert.deepEqual(results.map((r) => r.score), [84, 78]);
});

test("findCandidateMatches skips outfits that are already saved and takes the next best", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });
  const chinos = clothes({ subtype: "Chinos", type: "bottom" });

  const existingKeys = new Set([dedupeKey(["Short t-shirt", "Jeans"])]);

  const results = findCandidateMatches(
    newTop, [newTop, jeans, chinos], context(openBaseline(["Short t-shirt", "Jeans", "Chinos"], 70)), { existingKeys, limit: 1 }
  );

  assert.equal(results.length, 1);
  assert.deepEqual(new Set(results[0].clothes), new Set(["Short t-shirt", "Chinos"]));
});

test("a top on the requires-layering list is only used in 2-top shapes", () => {
  const warmJumper = clothes({ subtype: "Warm jumper", type: "top" });
  const tshirt = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const results = findCandidateMatches(
    warmJumper,
    [warmJumper, tshirt, jeans],
    context(openBaseline(["Warm jumper", "Short t-shirt", "Jeans"]), {
      layeringRules: { requiresLayeringSet: new Set(["Warm jumper"]), requiresTopSet: new Set() },
    })
  );

  assert.equal(results.find((r) => r.clothes.length === 2), undefined);
  assert.notEqual(results.find((r) => r.clothes.length === 3), undefined);
});

test("Overalls are only matched in shapes with a top", () => {
  const overalls = clothes({ subtype: "Overalls", type: "onepiece" });
  const tshirt = clothes({ subtype: "Short t-shirt", type: "top" });
  const coat = clothes({ subtype: "Puffer coat", type: "outer" });

  const results = findCandidateMatches(
    overalls,
    [overalls, tshirt, coat],
    context(openBaseline(["Overalls", "Short t-shirt", "Puffer coat"]), {
      layeringRules: { requiresLayeringSet: new Set(), requiresTopSet: new Set(["Overalls"]) },
    })
  );

  assert.notEqual(results.length, 0);
  results.forEach((result) => assert.equal(result.topCount, 1));
});

test("the search stops once the budget's time limit has passed", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });
  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };

  const expired = createBudget({ timeLimitMs: -1 });

  const results = findShapeCombinations(
    newTop, topBottomShape, pools, context(openBaseline(["Short t-shirt", "Jeans"])), expired
  );

  assert.equal(results.length, 0);
});

test("isStillViable fails when the items share no tag, or one is untagged", () => {
  const colorRules = getColorRules("mid");

  assert.equal(isStillViable([
    clothes({ subtype: "A", tags: ["Work", "Everyday"] }),
    clothes({ subtype: "B", tags: ["Everyday"] }),
  ], colorRules), true);

  assert.equal(isStillViable([
    clothes({ subtype: "A", tags: ["Work"] }),
    clothes({ subtype: "B", tags: ["Party"] }),
  ], colorRules), false);

  assert.equal(isStillViable([clothes({ subtype: "A", tags: [] })], colorRules), false);
});

test("findShapeCombinations prunes a candidate with no tag in common", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top", tags: ["Work"] });
  const jeans = clothes({ subtype: "Jeans", type: "bottom", tags: ["Party"] });
  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };

  const results = findShapeCombinations(
    newTop, topBottomShape, pools, context(openBaseline(["Short t-shirt", "Jeans"])), createBudget()
  );

  assert.equal(results.length, 0);
});

test("isStillViable fails on colour, pattern, or season the same way the final checks would", () => {
  const colorRules = getColorRules("mid");
  const cream = clothes({ subtype: "A", colors: ["Cream"], styles: ["plain"] });

  assert.equal(isStillViable([cream], colorRules), true);

  const incompatibleColours = clothes({ subtype: "B", colors: ["Neon Green"], styles: ["plain"] });
  assert.equal(isStillViable([cream, incompatibleColours], colorRules), false);

  const twoPatterned = [
    clothes({ subtype: "C", styles: ["patterned"] }),
    clothes({ subtype: "D", styles: ["patterned"] }),
  ];
  assert.equal(isStillViable(twoPatterned, colorRules), false);

  const noSharedSeason = [
    clothes({ subtype: "E", spring: true, summer: false, autumn: false, winter: false }),
    clothes({ subtype: "F", spring: false, summer: true, autumn: false, winter: false }),
  ];
  assert.equal(isStillViable(noSharedSeason, colorRules), false);
});

test("findShapeCombinations prunes a colour-incompatible candidate during the search", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top", colors: ["Cream"] });
  const jeans = clothes({ subtype: "Jeans", type: "bottom", colors: ["Neon Green"] });
  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };

  const results = findShapeCombinations(
    newTop, topBottomShape, pools, context(openBaseline(["Short t-shirt", "Jeans"])), createBudget()
  );

  assert.equal(results.length, 0);
});

test("findShapeCombinations prunes a candidate that pushes the outfit's distinct colour count over the level's cap", () => {
  // Both items' colours fit comfortably within a single real palette, but
  // combined they total 8 distinct colours - over "mid"'s cap of 6.
  const newTop = clothes({
    subtype: "Short t-shirt", type: "top",
    colors: ["Cream", "Camel", "Tan", "White"], styles: ["plain"],
  });
  const jeans = clothes({
    subtype: "Jeans", type: "bottom",
    colors: ["Gold", "Olive Green", "Brown", "Peach"], styles: ["plain"],
  });

  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };
  const baseline = openBaseline(["Short t-shirt", "Jeans"]);

  const midResults = findShapeCombinations(
    newTop, topBottomShape, pools, context(baseline, { colorRules: getColorRules("mid") }), createBudget()
  );
  assert.equal(midResults.length, 0);

  const maxResults = findShapeCombinations(
    newTop, topBottomShape, pools, context(baseline, { colorRules: getColorRules("max") }), createBudget()
  );
  assert.equal(maxResults.length, 1);
});

test("findShapeCombinations rejects a whole shape when newItem can't fill its slot", () => {
  const warmJumper = clothes({ subtype: "Warm jumper", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });
  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };

  const results = findShapeCombinations(
    warmJumper,
    topBottomShape,
    pools,
    context(openBaseline(["Warm jumper", "Jeans"]), {
      layeringRules: { requiresLayeringSet: new Set(["Warm jumper"]), requiresTopSet: new Set() },
    }),
    createBudget()
  );

  assert.equal(results.length, 0);
});

test("findCandidateMatches drops outfits whose pair blend is below the minimum, however good their colours", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const bottoms = ["Jeans", "Chinos"].map((subtype) => clothes({ subtype, type: "bottom" }));

  // Colour 75. A pair of 64 would score 0.6 * 64 + 0.4 * 75 = 68 overall,
  // but its pair blend is below MIN_AUTO_SCORE. A pair of 65 is kept.
  const baseline = openBaseline(["Short t-shirt", "Jeans", "Chinos"]);
  [["Jeans", MIN_AUTO_SCORE], ["Chinos", MIN_AUTO_SCORE - 1]].forEach(([subtype, score]) => {
    baseline["Short t-shirt"][subtype] = score;
    baseline[subtype]["Short t-shirt"] = score;
  });

  const results = findCandidateMatches(newTop, [newTop, ...bottoms], scoringContext(baseline));

  assert.deepEqual(results.map((r) => r.score), [69]);
});

test("findCandidateMatches drops outfits whose colour score is below the minimum, however good their pairs", () => {
  // Bold palette at mid scores 65. 1 colour (65) -> colour 65, kept;
  // 2 colours (55) -> colour 60, dropped even with a pair of 90.
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const creamJeans = clothes({ subtype: "Jeans", type: "bottom" });
  const camelChinos = clothes({ subtype: "Chinos", type: "bottom", colors: ["Camel"] });

  const results = findCandidateMatches(
    newTop,
    [newTop, creamJeans, camelChinos],
    scoringContext(openBaseline(["Short t-shirt", "Jeans", "Chinos"], 90), "bold")
  );

  // 0.6 * 90 + 0.4 * 65 = 80
  assert.deepEqual(results.map((r) => r.score), [80]);
  assert.deepEqual(new Set(results[0].clothes), new Set(["Short t-shirt", "Jeans"]));
});

test("findShapeCombinations prunes a candidate that pairs below MIN_PAIR_SCORE with anything chosen", () => {
  // Pairs 45, 90, 90 would blend to 0.7 * 75 + 0.3 * 45 = 66 - but the 45
  // pair ends the branch.
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const linen = clothes({ subtype: "Linen shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const baseline = openBaseline(["Short t-shirt", "Linen shirt", "Jeans"], 90);
  baseline["Short t-shirt"]["Linen shirt"] = MIN_PAIR_SCORE - 5;
  baseline["Linen shirt"]["Short t-shirt"] = MIN_PAIR_SCORE - 5;

  const pools = { top: [linen], bottom: [jeans], onepiece: [], outer: [] };

  assert.equal(findShapeCombinations(newTop, twoTopShape, pools, context(baseline), createBudget()).length, 0);
  assert.equal(pairsWithAll([newTop], jeans, context(baseline)), true);
  assert.equal(pairsWithAll([newTop, jeans], linen, context(baseline)), false);
});

test("scoreItemSet gives a onepiece on its own the single-item score, whatever its colours", () => {
  const dress = clothes({ subtype: "Dress", type: "onepiece", colors: ["Fuchsia", "Lime Green"] });

  assert.equal(scoreItemSet([dress], scoringContext(openBaseline(["Dress"]), "bold")), SINGLE_ITEM_SCORE);
});

test("scoreItemSet is null when the pair blend or colour score is below MIN_AUTO_SCORE", () => {
  const top = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom", colors: ["Camel"] });

  // 2 colours, bold: colour (55 + 65) / 2 = 60
  assert.equal(scoreItemSet([top, jeans], scoringContext(openBaseline(["Short t-shirt", "Jeans"], 90), "bold")), null);
  // 2 colours, common: colour (55 + 85) / 2 = 70; pair 64
  assert.equal(scoreItemSet([top, jeans], scoringContext(openBaseline(["Short t-shirt", "Jeans"], 64))), null);
  // pair 65, colour 70: 0.6 * 65 + 0.4 * 70 = 67
  assert.equal(scoreItemSet([top, jeans], scoringContext(openBaseline(["Short t-shirt", "Jeans"], 65))), 67);
});

test("dedupeKey is the same whatever order the clothing ids are in", () => {
  assert.equal(dedupeKey(["b", "a", "c"]), dedupeKey(["c", "b", "a"]));
});

test("isOnlyDuplicateKeyErrors is true only when every failed write is a duplicate", () => {
  assert.equal(isOnlyDuplicateKeyErrors({ code: 11000 }), true);
  assert.equal(isOnlyDuplicateKeyErrors({ writeErrors: [{ code: 11000 }, { err: { code: 11000 } }] }), true);
  assert.equal(isOnlyDuplicateKeyErrors({ writeErrors: [{ code: 11000 }, { code: 121 }] }), false);
  assert.equal(isOnlyDuplicateKeyErrors(new Error("connection lost")), false);
});
