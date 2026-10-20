const cloudinary = require("../cloudinary.js");

const { Clothes, Footwear } = require("../models/AllModels.js");

/*
 * Cloudinary image clean-up for clothing and footwear. Images are uploaded
 * straight from the browser, so the server only ever deletes them.
 */

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

// After an update: if the item got a new image, the old one is unused.
const deleteReplacedImage = async (oldItem, updatedItem) => {
  const oldImageId = oldItem?.cloudinaryId;

  if (oldImageId && oldImageId !== updatedItem?.cloudinaryId) {
    await destroyImage(oldImageId, "replaced");
  }
};

// Whether any clothing or footwear item (of any user) still uses the image,
// apart from the item `exceptId` (the one being saved).
const isImageInUse = async (publicId, { exceptId = null } = {}) => {
  const filter = exceptId
    ? { cloudinaryId: publicId, _id: { $ne: exceptId } }
    : { cloudinaryId: publicId };

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
  destroyImage,
  deleteReplacedImage,
  isImageInUse,
  canUseImage,
  IMAGE_IN_USE_ERROR,
};
