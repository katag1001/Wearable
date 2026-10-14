const { destroyImage, isImageInUse } = require("../services/imageService.js");

/*
 * POST /cloudinary/delete { publicId }
 *
 * The add forms upload an image before saving the item. If the save then
 * fails (e.g. a duplicate), they call this to remove the image they just
 * uploaded. Only images no item uses can be deleted, so this can't remove
 * anyone's saved clothing or footwear image.
 */
exports.deleteUnusedImage = async (req, res) => {
  const userId = req.user?.userId;
  const { publicId } = req.body || {};

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!publicId || typeof publicId !== "string") {
    return res.status(400).json({ error: "Missing publicId" });
  }

  try {
    if (await isImageInUse(publicId)) {
      return res.status(409).json({ error: "Image is still in use" });
    }

    await destroyImage(publicId, "unused upload");

    return res.json({ message: "Image deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
