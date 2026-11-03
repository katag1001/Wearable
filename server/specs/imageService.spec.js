const test = require("node:test");
const assert = require("node:assert/strict");

const cloudinary = require("../cloudinary.js");
const {
  deleteReplacedImage,
  destroyItemImages,
  withReplacedImageFields,
} = require("../services/imageService.js");

// Records destroy calls instead of contacting Cloudinary.
const stubDestroy = (t, { fail = false } = {}) => {
  const destroyed = [];

  t.mock.method(cloudinary.uploader, "destroy", async (publicId) => {
    if (fail) throw new Error("network down");
    destroyed.push(publicId);
    return { result: "ok" };
  });

  return destroyed;
};

test("deleteReplacedImage deletes the old image when the item got a new one", async (t) => {
  const destroyed = stubDestroy(t);

  await deleteReplacedImage({ cloudinaryId: "old" }, { cloudinaryId: "new" });

  assert.deepEqual(destroyed, ["old"]);
});

test("deleteReplacedImage keeps the image when it didn't change", async (t) => {
  const destroyed = stubDestroy(t);

  await deleteReplacedImage({ cloudinaryId: "same" }, { cloudinaryId: "same" });

  assert.deepEqual(destroyed, []);
});

test("deleteReplacedImage does nothing when the item had no image", async (t) => {
  const destroyed = stubDestroy(t);

  await deleteReplacedImage({ cloudinaryId: "" }, { cloudinaryId: "new" });

  assert.deepEqual(destroyed, []);
});

test("deleteReplacedImage doesn't throw when Cloudinary fails", async (t) => {
  stubDestroy(t, { fail: true });
  t.mock.method(console, "error", () => {});

  await assert.doesNotReject(
    deleteReplacedImage({ cloudinaryId: "old" }, { cloudinaryId: "new" })
  );
});

const withAllImages = (id) => ({
  cloudinaryId: id,
  thumbnailCloudinaryId: `${id}_thumb`,
  originalCloudinaryId: `${id}_original`,
});

test("deleting an item deletes its image, thumbnail and original", async (t) => {
  const destroyed = stubDestroy(t);

  await destroyItemImages(withAllImages("a"), "item deleted");

  assert.deepEqual(destroyed, ["a", "a_thumb", "a_original"]);
});

test("a replaced image takes its thumbnail and original with it", async (t) => {
  const destroyed = stubDestroy(t);

  await deleteReplacedImage(withAllImages("old"), { cloudinaryId: "new" });

  assert.deepEqual(destroyed, ["old", "old_thumb", "old_original"]);
});

test("a new image clears the old thumbnail and original fields", () => {
  const existing = withAllImages("old");

  assert.deepEqual(withReplacedImageFields({ name: "x" }, existing), { name: "x" });
  assert.deepEqual(withReplacedImageFields({ cloudinaryId: "old" }, existing), { cloudinaryId: "old" });
  assert.deepEqual(withReplacedImageFields({ cloudinaryId: "new" }, existing), {
    thumbnailUrl: "",
    thumbnailCloudinaryId: "",
    originalImageUrl: "",
    originalCloudinaryId: "",
    cloudinaryId: "new",
  });
});
