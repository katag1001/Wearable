const test = require("node:test");
const assert = require("node:assert/strict");

// URLs need a cloud name; tests don't load server/.env.
process.env.CLOUD_NAME = process.env.CLOUD_NAME || "test-cloud";

const { derivedImageFields } = require("../services/backgroundRemovalService.js");
const { withDerivedImageFields } = require("../services/imageService.js");

test("a background-removed image gets its thumbnail and original from its id", () => {
  const fields = derivedImageFields("abc123_nobg");

  assert.equal(fields.thumbnailCloudinaryId, "abc123_thumb");
  assert.equal(fields.originalCloudinaryId, "abc123");
  assert.match(fields.thumbnailUrl, /abc123_thumb/);
  assert.match(fields.originalImageUrl, /abc123/);
});

test("any other image gets nothing derived", () => {
  assert.deepEqual(derivedImageFields("abc123"), {});
  assert.deepEqual(derivedImageFields(undefined), {});
});

test("a save only gains derived fields when it sends a background-removed image", () => {
  assert.deepEqual(withDerivedImageFields({ name: "Top" }), { name: "Top" });
  assert.deepEqual(withDerivedImageFields({ cloudinaryId: "plain" }), { cloudinaryId: "plain" });
  assert.equal(withDerivedImageFields({ cloudinaryId: "x_nobg" }).originalCloudinaryId, "x");
});
