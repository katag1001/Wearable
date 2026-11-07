const test = require("node:test");
const assert = require("node:assert/strict");

const {
  FULL_REBUILD_SHARE,
  preferencesAfter,
  planPreferenceChange,
  rebuildItemsFor,
} = require("../services/preferenceChangeService.js");

const saved = {
  gender: "woman",
  colour: "min",
  pattern: "min",
  temperature: 2,
  seasonality: 5,
  trends: 4,
  favouriteColourFamilies: ["reds", "greens", "blues"],
};

const plan = (changes, options) =>
  planPreferenceChange(saved, preferencesAfter(saved, changes), options);

const item = (id, overrides = {}) => ({
  _id: id,
  type: "top",
  subtype: "Vest",
  pattern: "Plain",
  ...overrides,
});

/* -------------------- preferencesAfter -------------------- */

test("preferencesAfter keeps saved values for fields left out", () => {
  const after = preferencesAfter(saved, { colour: "max", pattern: undefined });

  assert.equal(after.colour, "max");
  assert.equal(after.pattern, "min");
  assert.equal(after.gender, "woman");
});

test("preferencesAfter works for a new user with nothing saved", () => {
  assert.deepEqual(preferencesAfter(null, { gender: "man", colour: undefined }), { gender: "man" });
});

/* -------------------- planPreferenceChange -------------------- */

test("saving the same answers changes nothing", () => {
  assert.deepEqual(plan({ ...saved }), {
    rebuild: null,
    temperatureChanged: false,
    todayChanged: false,
  });
});

test("colour families in another order are the same answer", () => {
  assert.equal(plan({ favouriteColourFamilies: ["blues", "reds", "greens"] }).todayChanged, false);
});

test("a gender change rebuilds everything", () => {
  assert.deepEqual(plan({ gender: "unisex" }).rebuild, { allItems: true });
});

test("a colour level change rebuilds everything", () => {
  assert.deepEqual(plan({ colour: "mid" }).rebuild, { allItems: true });
});

test("a gender change wins over any partial change", () => {
  assert.deepEqual(
    plan({ gender: "man", pattern: "max" }, { changedPairs: [{ subtypeA: "A", subtypeB: "B" }] }).rebuild,
    { allItems: true }
  );
});

test("no answer and the default answer are the same", () => {
  const before = { gender: "woman", colour: null, pattern: null, temperature: null };
  const after = preferencesAfter(before, { colour: "mid", pattern: "mid", temperature: 3 });

  assert.deepEqual(planPreferenceChange(before, after), {
    rebuild: null,
    temperatureChanged: false,
    todayChanged: false,
  });
});

test("a pattern level change rebuilds only the patterned outfits", () => {
  assert.deepEqual(plan({ pattern: "mid" }).rebuild, {
    allItems: false,
    patterned: true,
    subtypes: [],
  });
});

test("changed pairing quiz parts rebuild the outfits with those subtypes", () => {
  const changedPairs = [
    { subtypeA: "Linen shirt", subtypeB: "Vest" },
    { subtypeA: "Linen shirt", subtypeB: "Croptop" },
  ];

  assert.deepEqual(plan({}, { changedPairs }).rebuild, {
    allItems: false,
    patterned: false,
    subtypes: ["Linen shirt", "Vest", "Croptop"],
  });
});

test("a temperature change rebuilds nothing but updates the ranges and Today", () => {
  assert.deepEqual(plan({ temperature: 4 }), {
    rebuild: null,
    temperatureChanged: true,
    todayChanged: true,
  });
});

test("colour families, seasonality and trends only change Today", () => {
  [{ favouriteColourFamilies: ["pinks"] }, { seasonality: 1 }, { trends: 2 }].forEach((changes) => {
    assert.deepEqual(plan(changes), {
      rebuild: null,
      temperatureChanged: false,
      todayChanged: true,
    });
  });
});

test("a new user's first answers are compared with the defaults", () => {
  const after = preferencesAfter(null, { gender: "woman", colour: "mid", pattern: "mid", temperature: 3 });

  assert.deepEqual(planPreferenceChange(null, after).rebuild, { allItems: true });
});

/* -------------------- rebuildItemsFor -------------------- */

test("nothing to rebuild gives no items", () => {
  assert.deepEqual(rebuildItemsFor(null, [item("a")]), { allItems: false, itemIds: [] });
});

test("a full rebuild takes every item that goes into outfits", () => {
  const wardrobe = [item("a"), item("b", { type: "bottom" }), item("shoe", { type: "footwear" })];

  assert.deepEqual(rebuildItemsFor({ allItems: true }, wardrobe), {
    allItems: true,
    itemIds: ["a", "b"],
  });
});

test("a pattern rebuild takes only the patterned items", () => {
  const wardrobe = [
    item("striped", { pattern: "Stripe" }),
    ...["p1", "p2", "p3", "p4"].map((id) => item(id)),
    item("unknown", { pattern: undefined }),
  ];

  assert.deepEqual(
    rebuildItemsFor({ allItems: false, patterned: true, subtypes: [] }, wardrobe),
    { allItems: false, itemIds: ["striped"] }
  );
});

test("a pairing rebuild takes the items of the changed subtypes", () => {
  const wardrobe = [
    item("shirt", { subtype: "Linen shirt" }),
    item("vest", { subtype: "Vest" }),
    ...["j1", "j2", "j3"].map((id) => item(id, { subtype: "Jeans", type: "bottom" })),
  ];

  assert.deepEqual(
    rebuildItemsFor({ allItems: false, patterned: false, subtypes: ["Linen shirt", "Vest"] }, wardrobe),
    { allItems: false, itemIds: ["shirt", "vest"] }
  );
});

test("a partial rebuild covering most of the wardrobe is done as a full one", () => {
  const count = 10;
  const inScope = Math.ceil(count * FULL_REBUILD_SHARE);
  const wardrobe = Array.from({ length: count }, (_, index) =>
    item(`i${index}`, { pattern: index < inScope ? "Floral" : "Plain" })
  );

  assert.equal(
    rebuildItemsFor({ allItems: false, patterned: true, subtypes: [] }, wardrobe).allItems,
    true
  );
});

test("a partial rebuild with no matching items rebuilds nothing", () => {
  assert.deepEqual(
    rebuildItemsFor({ allItems: false, patterned: false, subtypes: ["Kilt"] }, [item("a")]),
    { allItems: false, itemIds: [] }
  );
});
