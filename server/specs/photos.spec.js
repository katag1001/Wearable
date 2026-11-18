const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");

const r2 = require("../services/storage/r2Storage.js");
const {
  isOwnPhotoFile,
  isOwnPhotoKey,
  isOwnUploadKey,
  newPhotoKey,
  newUploadKey,
  photoFiles,
  userPrefix,
} = require("../services/photoKeys.js");
const { processUpload, PhotoError } = require("../services/photoService.js");
const { analysisImageFrom, backgroundColour } = require("../services/analysisImageService.js");

const USER = "0123456789abcdef01234567";
const OTHER = "76543210fedcba9876543210";

/* -------------------- Keys -------------------- */

test("new keys live under the user's own folder", () => {
  const upload = newUploadKey(USER, "jpg");
  const photo = newPhotoKey(USER);

  assert.ok(upload.startsWith(`users/${USER}/uploads/`) && upload.endsWith(".jpg"));
  assert.ok(photo.startsWith(`users/${USER}/photos/`));
  assert.equal(userPrefix(USER), `users/${USER}/`);
  assert.deepEqual(photoFiles(photo), [`${photo}-900.webp`, `${photo}-300.webp`]);
});

test("a key only counts as yours when it's well-formed and in your folder", () => {
  const upload = newUploadKey(USER, "webp");
  const photo = newPhotoKey(USER);

  assert.equal(isOwnUploadKey(upload, USER), true);
  assert.equal(isOwnUploadKey(upload, OTHER), false);
  assert.equal(isOwnUploadKey(photo, USER), false);
  assert.equal(isOwnUploadKey(`users/${USER}/uploads/../photos/x.jpg`, USER), false);
  assert.equal(isOwnUploadKey(`users/${USER}/uploads/not-a-uuid.jpg`, USER), false);
  assert.equal(isOwnUploadKey(undefined, USER), false);

  assert.equal(isOwnPhotoKey(photo, USER), true);
  assert.equal(isOwnPhotoKey(photo, OTHER), false);
  assert.equal(isOwnPhotoKey(`${photo}-900.webp`, USER), false);
  assert.equal(isOwnPhotoKey({ $ne: "" }, USER), false);
});

test("only the stored sizes of your own photos can be fetched", () => {
  const photo = newPhotoKey(USER);

  assert.equal(isOwnPhotoFile(`${photo}-900.webp`, USER), true);
  assert.equal(isOwnPhotoFile(`${photo}-300.webp`, USER), true);
  assert.equal(isOwnPhotoFile(`${photo}-1200.webp`, USER), false);
  assert.equal(isOwnPhotoFile(`${photo}-300.webp`, OTHER), false);
  assert.equal(isOwnPhotoFile(photo, USER), false);
  assert.equal(isOwnPhotoFile(newUploadKey(USER, "jpg"), USER), false);
});

/* -------------------- Processing -------------------- */

// A 400 x 600 transparent canvas with a red 200 x 300 oval "garment" in it.
const cutoutImage = () =>
  sharp({ create: { width: 400, height: 600, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: Buffer.from('<svg width="200" height="300"><ellipse cx="100" cy="150" rx="100" ry="150" fill="#b3262e"/></svg>'), left: 100, top: 150 }])
    .webp()
    .toBuffer();

const photoImage = () =>
  sharp({ create: { width: 1600, height: 1200, channels: 3, background: { r: 240, g: 230, b: 216 } } }).jpeg().toBuffer();

// Fake R2: the upload in memory, writes and deletes recorded.
const stubR2 = (t, { upload, bytes }) => {
  const written = {};
  const deleted = [];

  t.mock.method(r2, "fileInfo", async () => (upload ? { bytes: bytes ?? upload.length, contentType: "image/webp" } : null));
  t.mock.method(r2, "readFile", async () => upload);
  t.mock.method(r2, "writeFile", async (key, body) => { written[key] = body; });
  t.mock.method(r2, "deleteFile", async (key) => { deleted.push(key); });

  return { written, deleted };
};

test("a phone cut-out is trimmed to the garment and stored in both sizes; the upload is deleted", async (t) => {
  const upload = await cutoutImage();
  const { written, deleted } = stubR2(t, { upload });
  const uploadKey = newUploadKey(USER, "webp");

  const result = await processUpload({ userId: USER, uploadKey, background: "phone" });

  assert.equal(result.removedBy, "phone");
  assert.ok(isOwnPhotoKey(result.imageKey, USER));
  assert.deepEqual(Object.keys(written).sort(), photoFiles(result.imageKey).sort());
  assert.deepEqual(deleted, [uploadKey]);

  const large = await sharp(written[`${result.imageKey}-900.webp`]).metadata();
  const small = await sharp(written[`${result.imageKey}-300.webp`]).metadata();
  assert.deepEqual([large.width, large.height], [200, 300]); // trimmed, never enlarged
  assert.equal(Math.max(small.width, small.height), 300);
  assert.equal(large.format, "webp");
  assert.equal(large.hasAlpha, true);
});

test("the photo as taken is stored whole (not trimmed) and shrunk to 900 / 300", async (t) => {
  const { written } = stubR2(t, { upload: await photoImage() });

  const result = await processUpload({ userId: USER, uploadKey: newUploadKey(USER, "jpg"), background: "none" });

  assert.equal(result.removedBy, null);
  const large = await sharp(written[`${result.imageKey}-900.webp`]).metadata();
  assert.deepEqual([large.width, large.height], [900, 675]);
});

test("when Cloudflare can't remove the background, the photo is kept as taken", async (t) => {
  stubR2(t, { upload: await photoImage() });
  t.mock.method(console, "error", () => {});
  const saved = { url: process.env.CUTOUT_WORKER_URL, key: process.env.CUTOUT_WORKER_KEY };
  delete process.env.CUTOUT_WORKER_URL;
  delete process.env.CUTOUT_WORKER_KEY;

  try {
    const result = await processUpload({ userId: USER, uploadKey: newUploadKey(USER, "jpg"), background: "remove" });
    assert.equal(result.removedBy, null);
    assert.ok(result.imageKey);
  } finally {
    if (saved.url) process.env.CUTOUT_WORKER_URL = saved.url;
    if (saved.key) process.env.CUTOUT_WORKER_KEY = saved.key;
  }
});

test("a Cloudflare cut-out counts as removed by Cloudflare", async (t) => {
  const cutout = await cutoutImage();
  stubR2(t, { upload: await photoImage() });
  t.mock.method(globalThis, "fetch", async () => new Response(cutout, { status: 200 }));
  const saved = { url: process.env.CUTOUT_WORKER_URL, key: process.env.CUTOUT_WORKER_KEY };
  process.env.CUTOUT_WORKER_URL = "https://worker.example";
  process.env.CUTOUT_WORKER_KEY = "secret";

  try {
    const result = await processUpload({ userId: USER, uploadKey: newUploadKey(USER, "jpg"), background: "remove" });
    assert.equal(result.removedBy, "cloudflare");
  } finally {
    process.env.CUTOUT_WORKER_URL = saved.url ?? "";
    process.env.CUTOUT_WORKER_KEY = saved.key ?? "";
    if (!saved.url) delete process.env.CUTOUT_WORKER_URL;
    if (!saved.key) delete process.env.CUTOUT_WORKER_KEY;
  }
});

test("a missing or too-big upload is refused", async (t) => {
  stubR2(t, { upload: null });
  await assert.rejects(processUpload({ userId: USER, uploadKey: newUploadKey(USER, "jpg"), background: "none" }), PhotoError);

  t.mock.restoreAll();
  const { deleted } = stubR2(t, { upload: Buffer.from("x"), bytes: 50 * 1024 * 1024 });
  const uploadKey = newUploadKey(USER, "jpg");
  await assert.rejects(processUpload({ userId: USER, uploadKey, background: "none" }), /too big/);
  assert.deepEqual(deleted, [uploadKey]);
});

/* -------------------- Gemini's copy -------------------- */

test("Gemini gets a grey-backed JPEG, at most 1024 px", async () => {
  assert.deepEqual(backgroundColour("rgb:C8C8C8"), { r: 200, g: 200, b: 200 });

  const big = await sharp({ create: { width: 3000, height: 2000, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
  const copy = await analysisImageFrom(big);
  const meta = await sharp(Buffer.from(copy.data, "base64")).metadata();

  assert.equal(copy.mimeType, "image/jpeg");
  assert.equal(meta.format, "jpeg");
  assert.equal(Math.max(meta.width, meta.height), 1024);

  const { data } = await sharp(Buffer.from(copy.data, "base64")).raw().toBuffer({ resolveWithObject: true });
  assert.ok(Math.abs(data[0] - 200) <= 3, "the transparent area became grey");
});
