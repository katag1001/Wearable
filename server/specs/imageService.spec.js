const test = require("node:test");
const assert = require("node:assert/strict");

const cloudinary = require("../cloudinary.js");
const { deleteReplacedImage } = require("../services/imageService.js");

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
