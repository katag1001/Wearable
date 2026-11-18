// core/wardrobe/saveWardrobeItem.js
//
// Saving an item: make the newly chosen photo (if any) into an item photo
// (upload it, then the server stores its sizes - core/api/images.js), then
// create / update the item with its image key. If the save then fails, the
// new photo is discarded so no orphan is left behind. (On an update that
// replaced the photo, the server deletes the old one.)
//
// The chosen photo (components/wardrobe/PhotoPicker.jsx on the phone) is
// { uri, name, type } plus:
//   cutout: true        - cut out on the phone
//   cutoutFailed: {...} - the phone couldn't (why): Cloudflare removes the
//                         background
//   neither             - the photo as taken, by choice

import { discardPhotos, savePhoto } from "../api/images.js";
import { reportCutout } from "../images/cutoutNotice.js";
import { WARDROBE_KINDS } from "./itemKinds.js";

const buildPayload = (kind, formData, imageKey) => {
  const payload = { ...formData };

  WARDROBE_KINDS[kind].dropFields.forEach((field) => delete payload[field]);

  if (imageKey) {
    payload.imageKey = imageKey;
  }

  return payload;
};

// What the server should do about the chosen photo's background.
const backgroundFor = (image) =>
  image.cutout
    ? { background: "phone" }
    : image.cutoutFailed
      ? { cutoutFailure: image.cutoutFailed }
      : { background: "none" };

// Returns the saved item. Throws on failure (after cleaning up).
// `image` is the newly chosen photo (see above), or null.
export const saveWardrobeItem = async ({ kind, item, formData, image }) => {
  const { create, update } = WARDROBE_KINDS[kind];

  let photo = null;

  try {
    if (image) {
      photo = await savePhoto(image, backgroundFor(image));
      reportCutout(photo.removedBy);
    }

    const payload = buildPayload(kind, formData, photo?.imageKey);

    return item ? await update(item._id, payload) : await create(payload);
  } catch (err) {
    if (photo?.imageKey) {
      await discardPhotos([photo.imageKey]);
    }

    throw err;
  }
};
