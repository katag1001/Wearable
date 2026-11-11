const test = require("node:test");
const assert = require("node:assert/strict");

const { withShoeFirst, uniqueIds } = require("../services/matchFootwearService.js");

test("uniqueIds keeps the first of each id, in order, as strings", () => {
  assert.deepEqual(uniqueIds(["b", "a", "b", "c", "a"]), ["b", "a", "c"]);
  assert.deepEqual(uniqueIds(), []);
});

test("withShoeFirst adds a new shoe at the front", () => {
  assert.deepEqual(withShoeFirst(["a", "b"], "c"), ["c", "a", "b"]);
  assert.deepEqual(withShoeFirst([], "c"), ["c"]);
  assert.deepEqual(withShoeFirst(undefined, "c"), ["c"]);
});

test("withShoeFirst moves a remembered shoe to the front, never listing it twice", () => {
  assert.deepEqual(withShoeFirst(["a", "b", "c"], "c"), ["c", "a", "b"]);
  assert.deepEqual(withShoeFirst(["a", "b"], "a"), ["a", "b"]);
});
