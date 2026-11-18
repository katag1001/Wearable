// server/services/storage/r2Storage.js
//
// The private Cloudflare R2 bucket the item photos live in, through its
// S3-compatible API. Settings (server/.env, Vercel): R2_ACCOUNT_ID,
// R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.

const { Readable } = require("stream");
const {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

let client = null;

const isConfigured = () =>
  Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );

const bucket = () => process.env.R2_BUCKET;

const s3 = () => {
  if (!isConfigured()) {
    throw new Error("Photo storage isn't set up (R2_* settings missing)");
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      // Newer AWS SDKs add checksum fields by default, which R2 can reject
      // (and which would make signed upload links need extra headers).
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  return client;
};

// A link the phone can PUT one file to, for `seconds`; only with this
// Content-Type.
const signedUploadUrl = (key, contentType, seconds) =>
  getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }), {
    expiresIn: seconds,
  });

// The file's size and type, or null if it isn't there.
const fileInfo = async (key) => {
  try {
    const head = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return { bytes: head.ContentLength, contentType: head.ContentType };
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") return null;
    throw error;
  }
};

const readFile = async (key) => {
  const result = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  return Buffer.from(await result.Body.transformToByteArray());
};

// The file as a stream (to send on), with its type and size; null if it
// isn't there.
const openFile = async (key) => {
  try {
    const result = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    const body = result.Body instanceof Readable ? result.Body : Readable.fromWeb(result.Body.transformToWebStream());
    return { body, contentType: result.ContentType, bytes: result.ContentLength, etag: result.ETag };
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NoSuchKey") return null;
    throw error;
  }
};

const writeFile = (key, body, contentType) =>
  s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }));

const deleteFile = (key) => s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));

// Deletes these files (one call for up to 1,000). Missing ones are fine.
const deleteFiles = async (keys) => {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);

    try {
      await s3().send(
        new DeleteObjectsCommand({ Bucket: bucket(), Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true } })
      );
    } catch {
      // Bulk delete refused: one at a time instead.
      for (const key of batch) await deleteFile(key);
    }
  }
};

// Every file whose key starts with `prefix`.
const listFiles = async (prefix) => {
  const keys = [];
  let token;

  do {
    const page = await s3().send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: prefix, ContinuationToken: token }));
    (page.Contents || []).forEach((item) => keys.push(item.Key));
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);

  return keys;
};

module.exports = {
  isConfigured,
  signedUploadUrl,
  fileInfo,
  readFile,
  openFile,
  writeFile,
  deleteFile,
  deleteFiles,
  listFiles,
};
