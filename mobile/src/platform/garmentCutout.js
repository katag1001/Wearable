// mobile/src/platform/garmentCutout.js
//
// Cutting the garment out of a photo on the phone, before it's uploaded
// (context/phone-cutout-plan.md; the native part is
// modules/garment-cutout). Used by the add-from-photo flow
// (core/hooks/usePhotoAnalysis.js) and when an item's photo is changed
// (components/wardrobe/PhotoPicker.jsx).
//
// It never throws: if the phone can't do it - no native part, an iPhone
// older than iOS 17, no Google Play services, too slow, an error - the
// photo is used as it was taken, and (unless this is the strict test
// build) the server asks Cloudinary to remove the background instead.

import { Platform } from "react-native";

import { cutOutGarment, isCutoutAvailable, prepareCutout } from "../../modules/garment-cutout";

// The strict test build (eas.json profile "preview-strict",
// EXPO_PUBLIC_CUTOUT_STRICT_TEST=1): no Cloudinary backup, and the reason
// a cut-out failed is shown on screen. Never set in "preview" or
// "production" - those use the backup and show no technical messages.
export const CUTOUT_STRICT_TEST = process.env.EXPO_PUBLIC_CUTOUT_STRICT_TEST === "1";

// After this long the cut-out counts as failed (normally it takes ~1 s;
// the first one may wait for ML Kit's model to download).
const TIME_LIMIT_MS = 15000;

const withTimeLimit = (promise, ms) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Took longer than ${ms / 1000} s`)),
      ms
    );

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

// What the server logs about a failed cut-out (no photo, nothing personal).
const failureReport = (reason) => ({
  reason: String(reason).slice(0, 1000),
  platform: Platform.OS,
  osVersion: String(Platform.Version),
});

// Cuts the garment out of `photo` (imagePicker's { uri, name, type }).
// Resolves to
//   { image: { uri, name, type, cutout: true } }  - the cut-out, to upload
//   { image: null, failure: { reason, platform, osVersion } }
// `cutout: true` makes core/api/images.js upload it under a "_cutout" id.
export const cutOutPhoto = async (photo) => {
  if (!isCutoutAvailable) {
    return { image: null, failure: failureReport("This app version can't cut out photos") };
  }

  try {
    const result = await withTimeLimit(cutOutGarment(photo.uri), TIME_LIMIT_MS);

    return {
      image: {
        uri: result.uri,
        name: `cutout.${result.format}`,
        type: result.format === "webp" ? "image/webp" : "image/png",
        cutout: true,
      },
    };
  } catch (error) {
    return { image: null, failure: failureReport(error?.message || error) };
  }
};

// Called when the app opens, so the first cut-out doesn't wait for ML
// Kit's model to download. Never throws.
export const prepareGarmentCutout = () => {
  if (isCutoutAvailable) {
    prepareCutout();
  }
};
