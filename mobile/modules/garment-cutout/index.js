// mobile/modules/garment-cutout/index.js
//
// The app's side of the garment cut-out (context/phone-cutout-plan.md).
// The native halves are android/.../GarmentCutoutModule.kt (Google ML Kit)
// and ios/GarmentCutoutModule.swift (Apple Vision, iOS 17+).
//
// In a build without the native half (the web, Expo Go, or an older app
// version reached by an over-the-air update) `isCutoutAvailable` is false
// and nothing here touches native code. The app uses these through
// src/platform/garmentCutout.js, which adds the time limit.

import { requireOptionalNativeModule } from "expo";

const GarmentCutout = requireOptionalNativeModule("GarmentCutout");

export const isCutoutAvailable = GarmentCutout != null;

// Cuts the garment out of the photo at `uri` (file:// or content://).
// Resolves to { uri, width, height, bytes, format ("webp" | "png"),
// inputWidth, inputHeight, loadMs, segmentMs, saveMs, totalMs }; `uri` is a
// transparent image in the app's cache. Rejects if the phone can't do it
// or finds nothing.
export const cutOutGarment = (uri) => {
  if (!GarmentCutout) {
    return Promise.reject(new Error("This app version can't cut out photos."));
  }

  return GarmentCutout.cutOutAsync(uri);
};

// Gets the phone ready for its first cut-out (Android: downloads ML Kit's
// model). Never throws.
export const prepareCutout = async () => {
  try {
    await GarmentCutout?.prepareAsync?.();
  } catch {
    // The cut-out itself will try again (or fall back).
  }
};
