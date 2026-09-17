const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildRolePools,
  findShapeCombinations,
  findCandidateMatches,
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
    newTop, shape, pools, baseline, null, { remaining: 1000 }
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
    newTop, shape, pools, baseline, null, { remaining: 1000 }
  );

  assert.equal(results.length, 0);
});

test("findCandidateMatches produces a saveable match description for a compatible top+bottom wardrobe", () => {
  const newTop = clothes({ subtype: "Short t-shirt", type: "top", userId: "user1" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom", userId: "user1" });

  const allItems = [newTop, jeans];
  const baseline = fullyOpenBaseline(["Short t-shirt", "Jeans"]);

  const results = findCandidateMatches(newTop, allItems, baseline, null);

  assert.equal(results.length, 1);
  assert.equal(results[0].userMade, false);
  assert.deepEqual(new Set(results[0].clothes), new Set(["Short t-shirt", "Jeans"]));
});

test("findCandidateMatches excludes a top that needs layering from the 1-top shapes but includes it in the 2-top shapes", () => {
  const warmJumper = clothes({ subtype: "Warm jumper", type: "top" });
  const tshirt = clothes({ subtype: "Short t-shirt", type: "top" });
  const jeans = clothes({ subtype: "Jeans", type: "bottom" });

  const baseline = {
    "Warm jumper": { "Warm jumper": 0, "Short t-shirt": 5, Jeans: 5 },
    "Short t-shirt": { "Warm jumper": 5, "Short t-shirt": 5, Jeans: 5 },
    Jeans: { Jeans: 5, "Warm jumper": 5, "Short t-shirt": 5 },
  };

  const allItems = [warmJumper, tshirt, jeans];

  const results = findCandidateMatches(warmJumper, allItems, baseline, null);

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
