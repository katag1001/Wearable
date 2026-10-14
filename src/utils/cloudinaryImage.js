import axios from "axios";

import { URL } from "../config";

// Uploads the chosen image File to Cloudinary and returns its response
// ({ secure_url, public_id, ... }). Uses fetch rather than axios so the
// app's default Authorization header is NOT sent to Cloudinary.
export const uploadImageToCloudinary = async (file) => {

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
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

    await axios.post(
      `${URL}/cloudinary/delete`,
      { publicId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

  } catch (error) {
    console.error("Failed to clean up Cloudinary image after save failure:", error);
  }
};
