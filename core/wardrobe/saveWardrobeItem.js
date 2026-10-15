// core/wardrobe/saveWardrobeItem.js
//
// Saving an item: upload the newly chosen image (if any) to Cloudinary,
// then create / update the item with its URL. If the save then fails, the
// just-uploaded image is deleted again so no orphan is left behind. (On an
// update that replaced the image, the server deletes the old one.)

import { deleteUnusedImage, uploadImageToCloudinary } from "../api/images.js";
import { WARDROBE_KINDS } from "./itemKinds.js";

const buildPayload = (kind, formData, uploaded) => {
  const payload = { ...formData };

  WARDROBE_KINDS[kind].dropFields.forEach((field) => delete payload[field]);

  if (uploaded) {
    payload.imageUrl = uploaded.secure_url;
    payload.cloudinaryId = uploaded.public_id;
  }

  return payload;
};

// Returns the saved item. Throws on failure (after cleaning up).
// `image` is the newly chosen file (see uploadImageToCloudinary), or null.
export const saveWardrobeItem = async ({ kind, item, formData, image }) => {
  const { create, update } = WARDROBE_KINDS[kind];

  let uploaded = null;

  try {
    if (image) {
      uploaded = await uploadImageToCloudinary(image);
    }

    const payload = buildPayload(kind, formData, uploaded);

    return item ? await update(item._id, payload) : await create(payload);
  } catch (err) {
    if (uploaded?.public_id) {
      await deleteUnusedImage(uploaded.public_id);
    }

    throw err;
  }
};
