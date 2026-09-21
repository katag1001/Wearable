const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildRolePools,
  findShapeCombinations,
  findCandidateMatches,
  isStillViable,
} = require("../services/matchService.js");
const { OUTFIT_SHAPES } = require("../constants/outfitShapes.js");

function clothes(overrides) {
  return {
    _id: overrides.subtype,
    min_temp: 15,
    max_temp: 25,
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

function fullyOpenBaseline(subtypes) {
  const matrix = {};
  subtypes.forEach((a) => {
    matrix[a] = {};
    subtypes.forEach((b) => {
      matrix[a][b] = 5;
    });
  });
  return matrix;
}

test("buildRolePools groups wardrobe items by type and excludes the new item", () => {
  const newItem = clothes({ subtype: "NewTop", type: "top" });

  const allItems = [
    newItem,
    clothes({ subtype: "Jeans", type: "bottom" }),
    clothes({ subtype: "Blazer", type: "outer" }),
  ];

  const pools = buildRolePools(allItems, newItem);

  assert.equal(pools.top.length, 0);
  assert.equal(pools.bottom.length, 1);
  assert.equal(pools.outer.length, 1);
});

test("findShapeCombinations finds a valid top+bottom pair when everything is compatible", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };
  const baseline = fullyOpenBaseline(["Short t-shirt", "Jeans"]);
  const shape = OUTFIT_SHAPES.find((s) => s.top === 1 && s.bottom === 1 && s.outer === 0);

  const results = findShapeCombinations(
    newTop, shape, pools, baseline, null, { remaining: 1000 }, new Set()
  );

  assert.equal(results.length, 1);
  assert.deepEqual(
    new Set(results[0].map((i) => i.subtype)),
    new Set(["Short t-shirt", "Jeans"])
  );
});

test("findShapeCombinations finds nothing when the pair is incompatible", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };
  const baseline = {
    "Short t-shirt": { "Short t-shirt": 5, Jeans: 0 },
    Jeans: { Jeans: 5, "Short t-shirt": 0 },
  };
  const shape = OUTFIT_SHAPES.find((s) => s.top === 1 && s.bottom === 1 && s.outer === 0);

  const results = findShapeCombinations(
    newTop, shape, pools, baseline, null, { remaining: 1000 }, new Set()
  );

  assert.equal(results.length, 0);
});

test("findCandidateMatches produces a saveable match description for a compatible top+bottom wardrobe", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top", userId: "user1" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom", userId: "user1" });

  const allItems = [newTop, jeans];
  const baseline = fullyOpenBaseline(["Short t-shirt", "Jeans"]);

  const results = findCandidateMatches(newTop, allItems, baseline, null, new Set());

  assert.equal(results.length, 1);
  assert.equal(results[0].userMade, false);
  assert.deepEqual(new Set(results[0].clothes), new Set(["Short t-shirt", "Jeans"]));
});

test("findCandidateMatches excludes a top on the requires-layering list from the 1-top shapes but includes it in the 2-top shapes", () => {
  const warmJumper = clothes({ subtype: "Warm jumper", type: "top" });
  const tshirt = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const baseline = fullyOpenBaseline(["Warm jumper", "Short t-shirt", "Jeans"]);
  const requiresLayeringSet = new Set(["Warm jumper"]);

  const allItems = [warmJumper, tshirt, jeans];

  const results = findCandidateMatches(warmJumper, allItems, baseline, null, requiresLayeringSet);

  // Should NOT find [Warm jumper, Jeans] alone (needs layering).
  const soloTop = results.find((r) => r.clothes.length === 2);
  assert.equal(soloTop, undefined);

  // Should find [Warm jumper, Short t-shirt, Jeans] (layered).
  const layered = results.find((r) => r.clothes.length === 3);
  assert.notEqual(layered, undefined);
  assert.deepEqual(
    new Set(layered.clothes),
    new Set(["Warm jumper", "Short t-shirt", "Jeans"])
  );
});

test("the same physical item is never used twice in one outfit, even when a 2nd top of the identical subtype is needed but not owned", () => {
  // Only ONE "Short t-shirt" exists in the wardrobe (it IS the new item).
  // A 2-top shape needs a second, different top - there's nothing else to
  // pick, so no 2-top combination should ever be produced from thin air.
  const onlyTshirt = clothes({ _id: "physical-1", subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ _id: "physical-2", subtype: "Jeans", type: "bottom" });

  const baseline = fullyOpenBaseline(["Short t-shirt", "Jeans"]);

  const results = findCandidateMatches(onlyTshirt, [onlyTshirt, jeans], baseline, null, new Set());

  const twoTopCombo = results.find((r) => r.topCount === 2);
  assert.equal(twoTopCombo, undefined);
});

test("two distinct physical items of the identical subtype can legitimately both appear in one outfit", () => {
  // Two DIFFERENT real garments that happen to be the same subtype -
  // distinguishable only by _id. This should be allowed (it's two real
  // t-shirts layered), and every clothes id in any single result must be
  // unique (no physical item repeated within the same outfit).
  const tshirtA = clothes({ _id: "physical-1", subtype: "Short t-shirt", type: "top" });
  const tshirtB = clothes({ _id: "physical-2", subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ _id: "physical-3", subtype: "Jeans", type: "bottom" });

  const baseline = fullyOpenBaseline(["Short t-shirt", "Jeans"]);

  const results = findCandidateMatches(tshirtA, [tshirtA, tshirtB, jeans], baseline, null, new Set());

  const twoTopCombo = results.find((r) => r.topCount === 2);
  assert.notEqual(twoTopCombo, undefined);

  results.forEach((result) => {
    const uniqueIds = new Set(result.clothes.map(String));
    assert.equal(uniqueIds.size, result.clothes.length);
  });
});

test("isStillViable fails on colour, pattern, or season the same way the final checks would", () => {
  const cream = clothes({ subtype: "A", colors: ["Cream"], styles: ["plain"] });

  assert.equal(isStillViable([cream]), true);

  const incompatibleColours = clothes({ subtype: "B", colors: ["Neon Green"], styles: ["plain"] });
  assert.equal(isStillViable([cream, incompatibleColours]), false);

  const twoPatterned = [
    clothes({ subtype: "C", styles: ["patterned"] }),
    clothes({ subtype: "D", styles: ["patterned"] }),
  ];
  assert.equal(isStillViable(twoPatterned), false);

  const noSharedSeason = [
    clothes({ subtype: "E", spring: true, summer: false, autumn: false, winter: false }),
    clothes({ subtype: "F", spring: false, summer: true, autumn: false, winter: false }),
  ];
  assert.equal(isStillViable(noSharedSeason), false);
});

test("findShapeCombinations prunes a colour-incompatible candidate during the search, not just at the end", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top", colors: ["Cream"], styles: ["plain"] });
  const jeans = clothes({ subtype: "Jeans", type: "bottom", colors: ["Neon Green"], styles: ["plain"] });

  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };
  const baseline = fullyOpenBaseline(["Short t-shirt", "Jeans"]);
  const shape = OUTFIT_SHAPES.find((s) => s.top === 1 && s.bottom === 1 && s.outer === 0);

  const results = findShapeCombinations(
    newTop, shape, pools, baseline, null, { remaining: 1000 }, new Set()
  );

  // Matrix-compatible, but colours share no palette - pruned incrementally.
  assert.equal(results.length, 0);
});

test("findShapeCombinations rejects a whole shape immediately when newItem alone can't fill a single-slot layerable role", () => {
  const warmJumper = clothes({ subtype: "Warm jumper", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const pools = { top: [], bottom: [jeans], onepiece: [], outer: [] };
  const baseline = fullyOpenBaseline(["Warm jumper", "Jeans"]);
  const requiresLayeringSet = new Set(["Warm jumper"]);
  const shape = OUTFIT_SHAPES.find((s) => s.top === 1 && s.bottom === 1 && s.outer === 0);

  const results = findShapeCombinations(
    warmJumper, shape, pools, baseline, null, { remaining: 1000 }, requiresLayeringSet
  );

  assert.equal(results.length, 0);
});
