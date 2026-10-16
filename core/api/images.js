// core/api/images.js
//
// Item photos live on Cloudinary. The app uploads them there directly,
// then saves the returned URL on the item through the API.

// The browser and React Native both provide XMLHttpRequest.
/* global XMLHttpRequest */

import { getCoreConfig } from "../config.js";
import { api } from "./client.js";

// Uploads an image and returns Cloudinary's response
// ({ secure_url, public_id, ... }). `file` is whatever the platform's
// FormData takes: a File on the web, { uri, name, type } on a phone.
// Doesn't use the API client, so the login token is NOT sent to
// Cloudinary. Uses XMLHttpRequest rather than fetch: on the phone, Expo's
// fetch can't send { uri, name, type } parts ("Unsupported FormDataPart
// implementation"), but React Native's XMLHttpRequest can.
export const uploadImageToCloudinary = (file) => {
  const { cloudName, uploadPreset } = getCoreConfig();

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Cloudinary upload failed: ${request.responseText}`));
        return;
      }

      try {
        resolve(JSON.parse(request.responseText));
      } catch {
        reject(new Error("Cloudinary upload failed: invalid response"));
      }
    };

    request.onerror = () => reject(new Error("Cloudinary upload failed: network error"));

    request.send(formData);
  });
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
