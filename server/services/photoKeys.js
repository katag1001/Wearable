// server/services/photoKeys.js
//
// Where a user's photo files live in the bucket, and checking that a key
// a request sends is really one of that user's. Pure - no I/O.
//
//   users/<userId>/uploads/<uuid>.<jpg|png|webp>   a fresh upload, deleted
//                                                  once it's processed
//   users/<userId>/photos/<uuid>                    an item's photo (its
//                                                  "image key"); the files
//                                                  are <key>-900.webp and
//                                                  <key>-300.webp

const { randomUUID } = require("crypto");

const { PHOTO_SIZES } = require("../constants/photos.js");

const USER_ID = "[a-f0-9]{24}";
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const UPLOAD_KEY = new RegExp(`^users/(${USER_ID})/uploads/${UUID}\\.(jpg|png|webp)$`);
const PHOTO_KEY = new RegExp(`^users/(${USER_ID})/photos/${UUID}$`);
const PHOTO_FILE = new RegExp(`^(users/${USER_ID}/photos/${UUID})-(\\d+)\\.webp$`);

const userPrefix = (userId) => `users/${String(userId)}/`;

const newUploadKey = (userId, ending) => `${userPrefix(userId)}uploads/${randomUUID()}.${ending}`;

const newPhotoKey = (userId) => `${userPrefix(userId)}photos/${randomUUID()}`;

// The stored files of a photo: [<key>-900.webp, <key>-300.webp].
const photoFiles = (imageKey) => PHOTO_SIZES.map((size) => `${imageKey}-${size}.webp`);

const ownerOf = (pattern, key) => (typeof key === "string" ? key.match(pattern)?.[1] ?? null : null);

// Whether `key` is a well-formed upload / photo / photo file of this user.
const isOwnUploadKey = (key, userId) => ownerOf(UPLOAD_KEY, key) === String(userId);
const isOwnPhotoKey = (key, userId) => ownerOf(PHOTO_KEY, key) === String(userId);

const isOwnPhotoFile = (file, userId) => {
  const match = typeof file === "string" ? file.match(PHOTO_FILE) : null;

  return Boolean(match) && PHOTO_SIZES.includes(Number(match[2])) && isOwnPhotoKey(match[1], userId);
};

module.exports = {
  userPrefix,
  newUploadKey,
  newPhotoKey,
  photoFiles,
  isOwnUploadKey,
  isOwnPhotoKey,
  isOwnPhotoFile,
};
