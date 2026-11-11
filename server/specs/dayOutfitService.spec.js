const test = require("node:test");
const assert = require("node:assert/strict");

const { isCandidate } = require("../services/dayOutfitService.js");

const todayRange = { min: 10, max: 18 };
const outfit = (fields) => ({ _id: "a", min_temp: 10, max_temp: 18, tags: [], clothes: [], ...fields });
const context = (fields = {}) => ({
  leaveOut: new Set(),
  onlyTags: null,
  todayRange,
  temperature: null,
  ...fields,
});

test("isCandidate takes an outfit in a weather tier", () => {
  assert.equal(isCandidate(outfit(), context()), true);
  assert.equal(isCandidate(outfit({ min_temp: 25, max_temp: 30 }), context()), false);
});

test("isCandidate leaves out the outfits it's told to", () => {
  assert.equal(isCandidate(outfit(), context({ leaveOut: new Set(["a"]) })), false);
});

test("isCandidate with onlyTags keeps outfits with any of them, ignoring case", () => {
  const onlyTags = ["Business casual", "Formal office"];

  assert.equal(isCandidate(outfit({ tags: ["formal office"] }), context({ onlyTags })), true);
  assert.equal(isCandidate(outfit({ tags: ["Comfy casual"] }), context({ onlyTags })), false);
  assert.equal(isCandidate(outfit({ tags: [] }), context({ onlyTags })), false);
});
