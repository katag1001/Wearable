const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  parsePaging,
  resolvePage,
  combineConditions,
  parseIdList,
} = require("../services/queryHelpers.js");

test("parseIdList keeps unique valid ids and drops anything else", () => {
  const id = "507f1f77bcf86cd799439011";

  assert.deepEqual(parseIdList([id, id, "not-an-id"]), [id]);
  assert.deepEqual(parseIdList(id), []);
  assert.deepEqual(parseIdList(undefined), []);
});

test("parsePaging defaults to page 1 of 32", () => {
  assert.deepEqual(parsePaging({}), { page: 1, limit: DEFAULT_PAGE_SIZE });
  assert.equal(DEFAULT_PAGE_SIZE, 32);
});

test("parsePaging caps the page size and ignores bad page numbers", () => {
  assert.deepEqual(
    parsePaging({ page: "abc", limit: "5000" }),
    { page: 1, limit: MAX_PAGE_SIZE }
  );
});

test("resolvePage pulls a page past the end back to the last page", () => {
  assert.deepEqual(resolvePage(9, 32, 70), { page: 3, totalPages: 3 });
  assert.deepEqual(resolvePage(2, 32, 0), { page: 1, totalPages: 1 });
});

test("combineConditions drops unused rules and only scopes to the user when none are active", () => {
  assert.deepEqual(combineConditions("u", [null, null]), { userId: "u" });
  assert.deepEqual(
    combineConditions("u", [null, { favourite: true }]),
    { userId: "u", $and: [{ favourite: true }] }
  );
});
