const test = require("node:test");
const assert = require("node:assert/strict");

const { withShoeFirst } = require("../services/matchFootwearService.js");

test("withShoeFirst adds a new shoe at the front", () => {
  assert.deepEqual(withShoeFirst(["a", "b"], "c"), ["c", "a", "b"]);
  assert.deepEqual(withShoeFirst([], "c"), ["c"]);
  assert.deepEqual(withShoeFirst(undefined, "c"), ["c"]);
});

test("withShoeFirst moves a remembered shoe to the front, never listing it twice", () => {
  assert.deepEqual(withShoeFirst(["a", "b", "c"], "c"), ["c", "a", "b"]);
  assert.deepEqual(withShoeFirst(["a", "b"], "a"), ["a", "b"]);
});
