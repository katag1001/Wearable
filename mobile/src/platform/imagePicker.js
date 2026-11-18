// mobile/src/platform/imagePicker.js
//
// A photo for a wardrobe item, from the camera or the photo library.
// Returns { uri, name, type } (what core/api/images.js uploads), or null if
// cancelled. Throws PermissionDeniedError if the user has refused access.
//
// The photo is shrunk to at most MAX_SIDE pixels as a JPEG straight away,
// so the cut-out, the upload and storage all handle a small file
// (context/cloudflare-migration-plan.md: the smallest size that still looks
// sharp; the app stores 900 px at most).

import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export class PermissionDeniedError extends Error {}

// The longest side kept (background removal works best from ~1,000 px up).
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

const SOURCES = {
  camera: {
    requestPermission: ImagePicker.requestCameraPermissionsAsync,
    launch: ImagePicker.launchCameraAsync,
    deniedMessage:
      "Camera access is off. Turn it on for LovedWornSeen in your phone's settings to take photos.",
  },
  library: {
    requestPermission: ImagePicker.requestMediaLibraryPermissionsAsync,
    launch: ImagePicker.launchImageLibraryAsync,
    deniedMessage:
      "Photo access is off. Turn it on for LovedWornSeen in your phone's settings to choose photos.",
  },
};

const PICKER_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: true,
  quality: 1,
};

// The photo at most MAX_SIDE a side, as a JPEG file.
const shrink = async ({ uri, width, height }) => {
  const context = ImageManipulator.manipulate(uri);

  if (Math.max(width || 0, height || 0) > MAX_SIDE) {
    context.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }

  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });

  return saved.uri;
};

// source: "camera" | "library"
export const pickImage = async (source) => {
  const { requestPermission, launch, deniedMessage } = SOURCES[source];

  const permission = await requestPermission();

  if (!permission.granted) {
    throw new PermissionDeniedError(deniedMessage);
  }

  const result = await launch(PICKER_OPTIONS);

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];

  return {
    uri: await shrink(asset),
    name: "photo.jpg",
    type: "image/jpeg",
  };
};
