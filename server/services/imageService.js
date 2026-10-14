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

// Whether any clothing or footwear item (of any user) still uses the image.
const isImageInUse = async (publicId) => {
  const [clothing, footwear] = await Promise.all([
    Clothes.exists({ cloudinaryId: publicId }),
    Footwear.exists({ cloudinaryId: publicId }),
  ]);

  return Boolean(clothing || footwear);
};

module.exports = {
  destroyImage,
  deleteReplacedImage,
  isImageInUse,
};
