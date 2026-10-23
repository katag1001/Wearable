const test = require("node:test");
const assert = require("node:assert/strict");

const { isManualEdit, USER_EDIT_FIELDS } = require("../services/matchProtection.js");

const outfit = { min_temp: 10, max_temp: 18, tags: ["Everyday", "Work"], spring: true, noTights: false, favourite: false };

test("isManualEdit is true when an edit-page value changes", () => {
  assert.equal(isManualEdit(outfit, { min_temp: 11 }), true);
  assert.equal(isManualEdit(outfit, { tags: ["Everyday"] }), true);
  assert.equal(isManualEdit(outfit, { noTights: true }), true);
});

test("isManualEdit is false for an untouched save, reordered tags, or favouriting", () => {
  assert.equal(isManualEdit(outfit, { min_temp: 10, max_temp: 18, spring: true }), false);
  assert.equal(isManualEdit(outfit, { tags: ["Work", "Everyday"] }), false);
  assert.equal(isManualEdit(outfit, { favourite: true, lastWornDate: new Date() }), false);
});

test("USER_EDIT_FIELDS leaves out favouriting and wearing", () => {
  assert.equal(USER_EDIT_FIELDS.includes("favourite"), false);
  assert.equal(USER_EDIT_FIELDS.includes("lastWornDate"), false);
  assert.equal(USER_EDIT_FIELDS.includes("min_temp"), true);
});
