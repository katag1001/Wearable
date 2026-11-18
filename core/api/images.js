// core/api/images.js
//
// Item photos (context/cloudflare-migration-plan.md). They're stored
// privately in Cloudflare R2; the app never holds any storage keys:
//
//   uploadPhoto   asks our server for a short-lived signed link and PUTs
//                 the photo straight to storage with it -> an upload key
//   processPhoto  has the server make the item photo from an upload (the
//                 two stored sizes; Cloudflare removes the background
//                 when the phone couldn't) -> { imageKey, removedBy }
//   discardPhotos deletes photos made but never saved to an item
//
// (Adding from a photo with AI on goes through /items/analyse instead of
// processPhoto: core/api/analysis.js.)

// React Native provides XMLHttpRequest.
/* global XMLHttpRequest */

import { api } from "./client.js";

const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Sends `blob` with a PUT to `url` (the signed link). XMLHttpRequest, as
// React Native's fetch can't always send a file body.
const putFile = (url, blob, contentType) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", url);
    request.setRequestHeader("Content-Type", contentType);

    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`Photo upload failed (${request.status})`));
    request.onerror = () => reject(new Error("Photo upload failed: network error"));

    request.send(blob);
  });

// Uploads a photo ({ uri, type } from the phone) and returns its upload
// key. Throws if it can't.
export const uploadPhoto = async (file) => {
  const contentType = UPLOAD_TYPES.includes(file?.type) ? file.type : "image/jpeg";

  const { data } = await api.post("/images/upload-link", { contentType });
  const blob = await (await fetch(file.uri)).blob();

  await putFile(data.uploadUrl, blob, contentType);

  return data.uploadKey;
};

// The item photo made from an upload: { imageKey, removedBy } (removedBy:
// "phone" | "cloudflare" | null). `background`: "phone" (already cut out),
// "remove" (Cloudflare removes it), "none" (the photo as taken).
// `cutoutFailure`: why the phone couldn't, for the server's log. Throws if
// it can't be made.
export const processPhoto = async (uploadKey, { background, cutoutFailure } = {}) => {
  const response = await api.post("/images/process", {
    uploadKey,
    ...(background && { background }),
    ...(cutoutFailure && { cutoutFailure }),
  });

  return response.data.image;
};

// Uploads and processes in one go -> { imageKey, removedBy }.
export const savePhoto = async (file, options) => processPhoto(await uploadPhoto(file), options);

// Deletes photos that were made but never saved to an item. The server
// only deletes the user's own photos that no item uses, so it's always
// safe. Failures are logged, not thrown.
export const discardPhotos = async (imageKeys) => {
  const keys = (imageKeys || []).filter(Boolean);

  if (!keys.length) return;

  try {
    await api.post("/images/discard", { imageKeys: keys });
  } catch (error) {
    console.error("Failed to discard unused photos:", error);
  }
};
