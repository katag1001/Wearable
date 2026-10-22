const test = require("node:test");
const assert = require("node:assert/strict");

const {
  changedMatchingFields,
  outfitFieldsFor,
  isProtectedMatch,
  fitsAnOutfitShape,
  isValidAutoOutfit,
  planMatchRefresh,
} = require("../services/matchRefreshService.js");
const { getColorRules } = require("../utils/colorPalettes.js");

function clothes(overrides) {
  return {
    _id: overrides.subtype,
    name: overrides.subtype,
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

function match(items, overrides = {}) {
  return {
    _id: `match-${items.map((item) => item._id).join("-")}`,
    clothes: items.map((item) => item._id),
    spring: true,
    summer: true,
    autumn: true,
    winter: true,
    colors: ["Cream"],
    styles: ["plain"],
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
  const after = { ...before, winter: false, tags: ["Work"] };

  assert.deepEqual(changedMatchingFields(before, after).sort(), ["tags", "winter"]);
});

test("outfitFieldsFor maps item fields to the outfit fields they feed", () => {
  assert.deepEqual(outfitFieldsFor(["winter"]), ["winter"]);
  assert.deepEqual(outfitFieldsFor(["subtype"]).sort(), ["max_temp", "min_temp", "tights"]);
  assert.ok(outfitFieldsFor(["type"]).includes("hasOuter"));
});

test("isProtectedMatch covers favourites, user-made and worn outfits", () => {
  assert.equal(isProtectedMatch(match([top, bottom])), false);
  assert.equal(isProtectedMatch(match([top, bottom], { favourite: true })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { userMade: true })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { lastWornDate: new Date() })), true);
  assert.equal(isProtectedMatch(match([top, bottom], { timesWorn: 2 })), true);
});

test("fitsAnOutfitShape rejects item-sets with no matching shape", () => {
  const secondBottom = clothes({ subtype: "Skirt", type: "bottom" });

  assert.equal(fitsAnOutfitShape([top, bottom]), true);
  assert.equal(fitsAnOutfitShape([bottom, secondBottom]), false);
});

test("isValidAutoOutfit fails once the items share no season", () => {
  const summerOnlyTop = { ...top, spring: false, autumn: false, winter: false };
  const winterOnlyBottom = { ...bottom, spring: false, summer: false, autumn: false };

  assert.equal(isValidAutoOutfit([top, bottom], ctx), true);
  assert.equal(isValidAutoOutfit([summerOnlyTop, winterOnlyBottom], ctx), false);
});

test("planMatchRefresh refreshes only the changed outfit fields on a still-valid outfit", () => {
  const updatedTop = { ...top, winter: false };
  // A manual tag edit on the outfit must survive a season change.
  const existing = match([top, bottom], { tags: ["Manual"] });

  const { updates, deleteIds } = planMatchRefresh(
    [existing], byId([updatedTop, bottom]), ["winter"], ctx
  );

  assert.deepEqual(deleteIds, []);
  assert.deepEqual(updates, [{ _id: existing._id, fields: { winter: false } }]);
});

test("planMatchRefresh skips outfits whose fields already match", () => {
  const { updates } = planMatchRefresh([match([top, bottom])], byId([top, bottom]), ["winter"], ctx);

  assert.deepEqual(updates, []);
});

test("planMatchRefresh deletes an unprotected outfit that is no longer valid", () => {
  const updatedTop = { ...top, spring: false, summer: false, autumn: false, winter: false };
  const existing = match([top, bottom]);

  const { updates, deleteIds } = planMatchRefresh(
    [existing], byId([updatedTop, bottom]), ["spring", "summer", "autumn", "winter"], ctx
  );

  assert.deepEqual(deleteIds, [existing._id]);
  assert.deepEqual(updates, []);
});

test("planMatchRefresh keeps and refreshes a protected outfit that is no longer valid", () => {
  const updatedTop = { ...top, spring: false, summer: false, autumn: false, winter: false };

  [{ favourite: true }, { userMade: true }, { lastWornDate: new Date() }, { timesWorn: 1 }]
    .forEach((protection) => {
      const existing = match([top, bottom], protection);

      const { updates, deleteIds } = planMatchRefresh(
        [existing], byId([updatedTop, bottom]), ["winter"], ctx
      );

      assert.deepEqual(deleteIds, []);
      assert.deepEqual(updates, [{ _id: existing._id, fields: { winter: false } }]);
    });
});

test("planMatchRefresh leaves an outfit alone when one of its items is missing", () => {
  const { updates, deleteIds } = planMatchRefresh(
    [match([top, bottom])], byId([top]), ["winter"], ctx
  );

  assert.deepEqual(updates, []);
  assert.deepEqual(deleteIds, []);
});
