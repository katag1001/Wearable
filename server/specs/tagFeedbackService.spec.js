const test = require("node:test");
const assert = require("node:assert/strict");

const { isTag, withoutTag } = require("../services/tagFeedbackService.js");

test("the tag comes off the outfit's tags", () => {
  assert.deepEqual(withoutTag(["Work", "Casual"], "Work"), ["Casual"]);
});

test("an outfit without the tag is left alone", () => {
  assert.equal(withoutTag(["Casual"], "Work"), null);
  assert.equal(withoutTag(undefined, "Work"), null);
});

test("only a non-empty string is a tag", () => {
  assert.equal(isTag("Work"), true);
  assert.equal(isTag("  "), false);
  assert.equal(isTag(undefined), false);
  assert.equal(isTag(["Work"]), false);
});
