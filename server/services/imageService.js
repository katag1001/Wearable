// server/services/imageService.js
//
// Item photos on items (clothing and footwear): each item has one photo,
// its `imageKey` (services/photoKeys.js; the files are in R2 -
// services/photoService.js). This checks a save's photo belongs to the
// user and isn't another item's, and deletes photos no item needs any more.

const { Clothes, Footwear } = require("../models/AllModels.js");
const { deletePhoto } = require("./photoService.js");
const { isOwnPhotoKey } = require("./photoKeys.js");

const IMAGE_IN_USE_ERROR = "That image belongs to another item";
const IMAGE_NOT_YOURS_ERROR = "That image isn't one of yours";

// Every image of an item (deleting it, or its user).
const destroyItemImages = (item, reason) => deletePhoto(item?.imageKey, reason);

// After an update: if the item got a new photo, the old one is unused.
const deleteReplacedImage = async (oldItem, updatedItem) => {
  if (oldItem?.imageKey && oldItem.imageKey !== updatedItem?.imageKey) {
    await deletePhoto(oldItem.imageKey, "replaced");
  }
};

// Whether any clothing or footwear item uses the photo, apart from the
// item `exceptId` (the one being saved).
const isImageInUse = async (imageKey, { exceptId = null } = {}) => {
  const filter = exceptId ? { imageKey, _id: { $ne: exceptId } } : { imageKey };

  const [clothing, footwear] = await Promise.all([Clothes.exists(filter), Footwear.exists(filter)]);

  return Boolean(clothing || footwear);
};

// null if the save may use its photo (none, or the user's own unused
// one), else the error message. Every photo gets its own key, so a photo
// another item already uses means a hand-made request.
const imageProblem = async (fields, userId, options = {}) => {
  if (!fields.imageKey) return null;
  if (!isOwnPhotoKey(fields.imageKey, userId)) return IMAGE_NOT_YOURS_ERROR;
  if (await isImageInUse(fields.imageKey, options)) return IMAGE_IN_USE_ERROR;
  return null;
};

module.exports = {
  destroyItemImages,
  deleteReplacedImage,
  isImageInUse,
  imageProblem,
  IMAGE_IN_USE_ERROR,
  IMAGE_NOT_YOURS_ERROR,
};
