const cloudinary = require("../cloudinary.js");

const { Clothes, Footwear } = require("../models/AllModels.js");

/*
 * Cloudinary image clean-up for clothing and footwear. Images are uploaded
 * straight from the browser, so the server only ever deletes them.
 *
 * An item can have up to three images (ITEM_IMAGE_FIELDS): the one shown
 * (cloudinaryId), a small thumbnail, and the original photo kept from
 * before its background was removed. They're always deleted together.
 */

// The image id fields of an item, the shown image first.
const ITEM_IMAGE_FIELDS = ["cloudinaryId", "thumbnailCloudinaryId", "originalCloudinaryId"];

// Fields that belong to the shown image: when it's replaced they're
// cleared, since the old thumbnail and original are deleted with it.
const DERIVED_IMAGE_FIELDS = {
  thumbnailUrl: "",
  thumbnailCloudinaryId: "",
  originalImageUrl: "",
  originalCloudinaryId: "",
};

const itemImageIds = (item) =>
  [...new Set(ITEM_IMAGE_FIELDS.map((field) => item?.[field]).filter(Boolean))];

// Failures are logged, not thrown - a stray image shouldn't fail a save.
const destroyImage = async (publicId, reason) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary image ${publicId} (${reason}):`,
      error.message
    );
  }
};

// Every image of an item (deleting it, or its user).
const destroyItemImages = async (item, reason) => {
  for (const publicId of itemImageIds(item)) {
    await destroyImage(publicId, reason);
  }
};

// After an update: if the item got a new image, the old one - and its
// thumbnail and original - are unused.
const deleteReplacedImage = async (oldItem, updatedItem) => {
  const oldImageId = oldItem?.cloudinaryId;

  if (oldImageId && oldImageId !== updatedItem?.cloudinaryId) {
    const stillUsed = itemImageIds(updatedItem);

    for (const publicId of itemImageIds(oldItem)) {
      if (!stillUsed.includes(publicId)) {
        await destroyImage(publicId, "replaced");
      }
    }
  }
};

// The update's fields, plus clearing the old thumbnail and original when
// the shown image changes (unless the update sets them itself).
const withReplacedImageFields = (fields, existingItem) => {
  if (fields.cloudinaryId === undefined || fields.cloudinaryId === existingItem.cloudinaryId) {
    return fields;
  }

  return { ...DERIVED_IMAGE_FIELDS, ...fields };
};

// Whether any clothing or footwear item (of any user) still uses the image,
// apart from the item `exceptId` (the one being saved).
const usedBy = (publicId) => ({ $or: ITEM_IMAGE_FIELDS.map((field) => ({ [field]: publicId })) });

const isImageInUse = async (publicId, { exceptId = null } = {}) => {
  const filter = exceptId
    ? { ...usedBy(publicId), _id: { $ne: exceptId } }
    : usedBy(publicId);

  const [clothing, footwear] = await Promise.all([
    Clothes.exists(filter),
    Footwear.exists(filter),
  ]);

  return Boolean(clothing || footwear);
};

// Whether an item of a user other than `userId` uses the image (a new,
// unsaved upload isn't used by anyone).
const isImageUsedByAnotherUser = async (publicId, userId) => {
  const filter = { ...usedBy(publicId), userId: { $ne: userId } };

  const [clothing, footwear] = await Promise.all([
    Clothes.exists(filter),
    Footwear.exists(filter),
  ]);

  return Boolean(clothing || footwear);
};

// Every upload gets its own image, so an item being saved with an image
// another item already uses is a hand-made request - deleting this item
// later would delete the other one's photo. True when the save may go on.
const canUseImage = async (cloudinaryId, { exceptId = null } = {}) =>
  !cloudinaryId || !(await isImageInUse(cloudinaryId, { exceptId }));

const IMAGE_IN_USE_ERROR = "That image belongs to another item";

module.exports = {
  ITEM_IMAGE_FIELDS,
  destroyImage,
  destroyItemImages,
  deleteReplacedImage,
  withReplacedImageFields,
  isImageInUse,
  isImageUsedByAnotherUser,
  canUseImage,
  IMAGE_IN_USE_ERROR,
};
