const test = require("node:test");
const assert = require("node:assert/strict");

const {
  changedMatchingFields,
  outfitFieldsFor,
  isProtectedMatch,
  fitsAnOutfitShape,
  isValidAutoOutfit,
  planMatchRefresh,
  needsRematch,
} = require("../services/matchRefreshService.js");
const { getColorRules } = require("../utils/colorPalettes.js");
const { describeOutfit } = require("../services/outfitEvaluator.js");

function clothes(overrides) {
  return {
    _id: overrides.subtype,
    name: overrides.subtype,
    colors: ["Cream"],
    pattern: "Plain",
    tags: ["Everyday"],
    fabric: "",
    userId: "user1",
    ...overrides,
  };
}

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

function context(baselineMatrix) {
  return {
    baselineMatrix,
    adjustments: new Map(),
    layeringRules: { requiresLayeringSet: new Set(), requiresTopSet: new Set() },
    colorRules: getColorRules(null),
    temperaturePreference: null,
  };
}

// The season flags and temperature range describeOutfit gives these items
// (seasonalityService.js, presetTemperatureService.js).
function seasonFlagsOf(items) {
  const { spring, summer, autumn, winter, min_temp, max_temp } = describeOutfit(items, {
    isUserMade: true,
    colorRules: getColorRules(null),
  });

  return { spring, summer, autumn, winter, min_temp, max_temp };
}

function match(items, overrides = {}) {
  return {
    _id: `match-${items.map((item) => item._id).join("-")}`,
    clothes: items.map((item) => item._id),
    ...seasonFlagsOf(items),
    colors: ["Cream"],
    pattern: "Plain",
    tags: ["Everyday"],
    favourite: false,
    userMade: false,
    lastWornDate: null,
    timesWorn: 0,
    ...overrides,
  };
}

function byId(items) {
  return new Map(items.map((item) => [String(item._id), item]));
}

const top = clothes({ subtype: "Tee", type: "top" });
const bottom = clothes({ subtype: "Jeans", type: "bottom" });
const ctx = context(openBaseline(["Tee", "Jeans"]));

test("changedMatchingFields ignores the name and array order", () => {
  const before = clothes({ subtype: "Tee", type: "top", colors: ["Cream", "Black"] });
  const after = { ...before, name: "Renamed", colors: ["Black", "Cream"] };

  assert.deepEqual(changedMatchingFields(before, after), []);
});

test("changedMatchingFields lists each matching field that changed", () => {
  const before = clothes({ subtype: "Tee", type: "top" });
  const after = { ...before, fabric: "Velvet", tags: ["Work"] };

  assert.deepEqual(changedMatchingFields(before, after).sort(), ["fabric", "tags"]);
});

test("outfitFieldsFor maps item fields to the outfit fields they feed", () => {
  const seasons = ["autumn", "spring", "summer", "winter"];

  assert.deepEqual(outfitFieldsFor(["fabric"]).sort(), ["max_temp", "min_temp", ...seasons].sort());
  assert.deepEqual(outfitFieldsFor(["subtype"]).sort(), ["max_temp", "min_temp", "tights", ...seasons].sort());
  assert.ok(outfitFieldsFor(["colors"]).includes("summer"));
  assert.ok(outfitFieldsFor(["type"]).includes("hasOuter"));
});

test("isProtectedMatch covers favourites, rated, user-made, worn and hand-edited outfits", () => {
  assert.equal(isProtectedMatch(match([top, bottom])), false);
  assert.equal(isProtectedMatch(match([top, bottom], { favourite: true })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { userMade: true })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { lastWornDate: new Date() })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { timesWorn: 2 })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { userEdited: true })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { rating: 3 })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { rating: null })), false);
});

test("needsRematch is true for the fields that decide outfits, not the tights answer or fabric", () => {
  ["type", "subtype", "colors", "tags", "pattern"].forEach((field) => {
    assert.equal(needsRematch([field]), true, field);
  });
  assert.equal(needsRematch(["wearWithTights"]), false);
  assert.equal(needsRematch(["fabric"]), false);
  assert.equal(needsRematch([]), false);
});

test("fitsAnOutfitShape rejects item-sets with no matching shape", () => {
  const secondBottom = clothes({ subtype: "Skirt", type: "bottom" });

  assert.equal(fitsAnOutfitShape([top, bottom]), true);
  assert.equal(fitsAnOutfitShape([bottom, secondBottom]), false);
});

test("seasons never make an automatic outfit invalid", () => {
  const velvetTop = { ...top, fabric: "Velvet" };
  const linenBottom = { ...bottom, fabric: "Linen" };

  assert.equal(isValidAutoOutfit([top, bottom], ctx), true);
  assert.equal(isValidAutoOutfit([velvetTop, linenBottom], ctx), true);
});

test("planMatchRefresh refreshes only the changed season flags and range when a fabric changes", () => {
  const updatedTop = { ...top, fabric: "Velvet" };
  // A manual tag edit on the outfit must survive a fabric change.
  const existing = match([top, bottom], { tags: ["Manual"] });
  const expected = Object.fromEntries(
    Object.entries(seasonFlagsOf([updatedTop, bottom])).filter(([season, value]) => existing[season] !== value)
  );

  const { updates, deleteIds } = planMatchRefresh(
    [existing], byId([updatedTop, bottom]), outfitFieldsFor(["fabric"]), ctx
  );

  assert.equal(expected.summer, false, "velvet takes the outfit out of summer");
  assert.ok(expected.max_temp < existing.max_temp, "velvet makes the outfit warmer");
  assert.deepEqual(deleteIds, []);
  assert.deepEqual(updates, [{ _id: existing._id, fields: expected }]);
});

test("planMatchRefresh skips outfits whose fields already match", () => {
  const { updates } = planMatchRefresh([match([top, bottom])], byId([top, bottom]), outfitFieldsFor(["fabric"]), ctx);

  assert.deepEqual(updates, []);
});

test("planMatchRefresh deletes an unprotected outfit that is no longer valid", () => {
  const updatedTop = { ...top, tags: ["Work"] };
  const existing = match([top, bottom]);

  const { updates, deleteIds } = planMatchRefresh(
    [existing], byId([updatedTop, bottom]), ["tags"], ctx
  );

  assert.deepEqual(deleteIds, [existing._id]);
  assert.deepEqual(updates, []);
});

test("planMatchRefresh keeps and refreshes a protected outfit that is no longer valid", () => {
  const updatedTop = { ...top, tags: ["Work"] };

  [{ favourite: true }, { userMade: true }, { userEdited: true }, { lastWornDate: new Date() }, { timesWorn: 1 }]
    .forEach((protection) => {
      const existing = match([top, bottom], protection);

      const { updates, deleteIds } = planMatchRefresh(
        [existing], byId([updatedTop, bottom]), ["tags"], ctx
      );

      assert.deepEqual(deleteIds, []);
      assert.deepEqual(updates, [{ _id: existing._id, fields: { tags: [] } }]);
    });
});

test("planMatchRefresh leaves an outfit alone when one of its items is missing", () => {
  const { updates, deleteIds } = planMatchRefresh(
    [match([top, bottom])], byId([top]), ["fabric"], ctx
  );

  assert.deepEqual(updates, []);
  assert.deepEqual(deleteIds, []);
});

test("planMatchRefresh with rematch deletes every unprotected outfit, even a valid one", () => {
  const updatedTop = { ...top, colors: ["Cream", "Grey"] };
  const existing = match([top, bottom]);

  assert.equal(isValidAutoOutfit([updatedTop, bottom], ctx), true);

  const { updates, deleteIds } = planMatchRefresh(
    [existing], byId([updatedTop, bottom]), ["colors"], ctx, { rematch: true }
  );

  assert.deepEqual(deleteIds, [existing._id]);
  assert.deepEqual(updates, []);
});

test("planMatchRefresh with rematch keeps protected outfits and refreshes their colours", () => {
  const updatedTop = { ...top, colors: ["Grey"] };

  [{ favourite: true }, { userMade: true }, { userEdited: true }, { timesWorn: 1 }].forEach((protection) => {
    const existing = match([top, bottom], protection);

    const { updates, deleteIds } = planMatchRefresh(
      [existing], byId([updatedTop, bottom]), ["colors"], ctx, { rematch: true }
    );

    assert.deepEqual(deleteIds, []);
    assert.equal(updates.length, 1);
    assert.deepEqual([...updates[0].fields.colors].sort(), ["Cream", "Grey"]);
  });
});
