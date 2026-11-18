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
// photo as taken is uploaded and our Cloudflare Worker removes the
// background on the server instead (context/cloudflare-migration-plan.md).

import { Platform } from "react-native";

import { setCutoutNoticeListener } from "@core/images/cutoutNotice.js";

import { cutOutGarment, isCutoutAvailable, prepareCutout } from "../../modules/garment-cutout";
import { showDialog } from "../components/soft/Dialog";

// TESTING ONLY - take out before launch (context/before-launch.md, "Must
// take out"): tells the user whenever a photo's background was removed by
// Cloudflare because the phone couldn't do it. Set to false (or remove this
// and registerCutoutNotice) to stop it.
export const SHOW_CLOUDFLARE_CUTOUT_NOTICE = true;

// Called once at start-up (src/app/_layout.jsx).
export const registerCutoutNotice = () => {
  setCutoutNoticeListener(
    SHOW_CLOUDFLARE_CUTOUT_NOTICE
      ? () =>
          showDialog(
            "Background removed by Cloudflare",
            "The phone couldn't cut this photo out, so Cloudflare removed the background instead. (Test notice - it won't show after launch.)"
          )
      : null
  );
};

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
// `cutout: true` tells the server it's already cut out (no Cloudflare).
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
