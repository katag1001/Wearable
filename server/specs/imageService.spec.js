const test = require("node:test");
const assert = require("node:assert/strict");

const r2 = require("../services/storage/r2Storage.js");
const { deleteReplacedImage, destroyItemImages } = require("../services/imageService.js");

const KEY_A = "users/0123456789abcdef01234567/photos/11111111-1111-4111-8111-111111111111";
const KEY_B = "users/0123456789abcdef01234567/photos/22222222-2222-4222-8222-222222222222";

// Records deletes instead of contacting R2.
const stubDelete = (t, { fail = false } = {}) => {
  const deleted = [];

  t.mock.method(r2, "deleteFiles", async (keys) => {
    if (fail) throw new Error("network down");
    deleted.push(...keys);
  });

  return deleted;
};

test("deleteReplacedImage deletes the old photo's files when the item got a new one", async (t) => {
  const deleted = stubDelete(t);

  await deleteReplacedImage({ imageKey: KEY_A }, { imageKey: KEY_B });

  assert.deepEqual(deleted, [`${KEY_A}-900.webp`, `${KEY_A}-300.webp`]);
});

test("deleteReplacedImage keeps the photo when it didn't change", async (t) => {
  const deleted = stubDelete(t);

  await deleteReplacedImage({ imageKey: KEY_A }, { imageKey: KEY_A });

  assert.deepEqual(deleted, []);
});

test("deleteReplacedImage does nothing when the item had no photo", async (t) => {
  const deleted = stubDelete(t);

  await deleteReplacedImage({ imageKey: "" }, { imageKey: KEY_B });
  await deleteReplacedImage(null, { imageKey: KEY_B });

  assert.deepEqual(deleted, []);
});

test("destroyItemImages deletes both sizes", async (t) => {
  const deleted = stubDelete(t);

  await destroyItemImages({ imageKey: KEY_B }, "test");

  assert.deepEqual(deleted, [`${KEY_B}-900.webp`, `${KEY_B}-300.webp`]);
});

test("a failed delete is logged, never thrown (a stray file mustn't fail a save)", async (t) => {
  stubDelete(t, { fail: true });
  t.mock.method(console, "error", () => {});

  await assert.doesNotReject(destroyItemImages({ imageKey: KEY_A }, "test"));
});
