// core/api/images.js
//
// Item photos live on Cloudinary. The app uploads them there directly,
// then saves the returned URL on the item through the API.

import { getCoreConfig } from "../config.js";
import { api } from "./client.js";

// Uploads an image and returns Cloudinary's response
// ({ secure_url, public_id, ... }). `file` is whatever the platform's
// FormData takes: a File on the web, { uri, name, type } on a phone.
// Uses fetch rather than the API client so the login token is NOT sent
// to Cloudinary.
export const uploadImageToCloudinary = async (file) => {
  const { cloudName, uploadPreset } = getCoreConfig();

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${await response.text()}`);
  }

  return response.json();
};

// Removes an image uploaded for a save that then failed. The server only
// deletes images no item uses. Failures are logged, not thrown.
export const deleteUnusedImage = async (publicId) => {

  try {

    await api.post("/cloudinary/delete", { publicId });

  } catch (error) {
    console.error("Failed to clean up Cloudinary image after save failure:", error);
  }
};
