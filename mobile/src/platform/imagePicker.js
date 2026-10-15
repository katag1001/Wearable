// mobile/src/platform/imagePicker.js
//
// A photo for a wardrobe item, from the camera or the photo library.
// Returns what core/api/images.js uploads ({ uri, name, type } - the
// phone's version of the web's File), or null if cancelled.
// Throws PermissionDeniedError if the user has refused access.

import * as ImagePicker from "expo-image-picker";

export class PermissionDeniedError extends Error {}

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

// Cloudinary resizes on delivery, so the upload doesn't need full quality.
const PICKER_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: true,
  quality: 0.8,
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
  const type = asset.mimeType || "image/jpeg";

  return {
    uri: asset.uri,
    name: asset.fileName || `photo.${type.split("/")[1] || "jpg"}`,
    type,
  };
};
