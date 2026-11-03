import { useEffect, useRef, useState } from "react";

import { analyseItemPhoto } from "../api/analysis.js";
import { getErrorMessage } from "../api/errors.js";
import { deleteUnusedImage, uploadImageToCloudinary } from "../api/images.js";
import { WARDROBE_KINDS } from "../wardrobe/itemKinds.js";

/*
 * Adding an item from its photo alone (shared by the web and mobile apps).
 * The photo is uploaded to Cloudinary, then the server removes its
 * background and fills in everything else - clothing or footwear, name,
 * type, colours, pattern, fabric, tags (server/controllers/
 * analysisControllers.js). The item is shown and saved with the
 * background-removed photo (`image`); if the background couldn't be
 * removed, with the photo as uploaded.
 *
 * Steps:
 *   "pick"      - waiting for a photo (`notice` says why a photo was turned
 *                 down: "multiple" items or "none")
 *   "analysing" - uploading and analysing (a loading screen)
 *   "ready"     - analysed: the user checks what was found, changes
 *                 anything, and saves - an item form filled in from the
 *                 analysis (`reviewPrefill`; useAnalysedItemReview), which
 *                 calls markSaved
 *   "failed"    - couldn't analyse (`error`): the user fills the form in,
 *                 with the photo already attached (`manualPrefill`)
 *   "saved"     - `savedItem` { id, name, kind, hasMatches, message }
 *
 * The uploaded photo - and the background-removed images made from it -
 * are deleted again if the item is never saved: when another photo is
 * chosen, the flow restarts, or it's closed (unmount). The server only
 * deletes images no item uses, so that's always safe.
 */

export const NOTICES = {
  multiple:
    "We spotted more than one item in this photo. Please choose a photo of just one item.",
  none: "We couldn't see any clothing or footwear in this photo. Please try another one.",
};

const failureMessage = (err) => {
  const code = err.response?.data?.code;

  if (code === "daily_limit") return getErrorMessage(err, "");

  return "We couldn't analyse this photo. You can fill in the details yourself.";
};

export const usePhotoAnalysis = () => {
  const [step, setStep] = useState("pick");
  // The chosen photo (a File on the web, { uri, name, type } on a phone).
  const [photo, setPhoto] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");
  // { kind, fields } from the server.
  const [result, setResult] = useState(null);
  // { imageUrl, cloudinaryId } once uploaded - the background-removed
  // photo once the analysis has made it.
  const [image, setImage] = useState(null);
  const [savedItem, setSavedItem] = useState(null);

  // Ignores an analysis that finishes after the user moved on.
  const runRef = useRef(0);
  // Every image made for this photo (the upload, and the background-
  // removed photo and its thumbnail) while no saved item uses them.
  const unsavedImagesRef = useRef([]);

  const discardImage = () => {
    const publicIds = unsavedImagesRef.current;

    unsavedImagesRef.current = [];

    publicIds.forEach((publicId) => deleteUnusedImage(publicId));
  };

  // The server's background-removed photo (`removed`, or null if it
  // couldn't be made): shown and saved instead of the upload.
  const takeRemovedImage = (removed) => {
    if (!removed?.cloudinaryId) return;

    unsavedImagesRef.current = [...unsavedImagesRef.current, ...(removed.createdIds || [removed.cloudinaryId])];
    setImage({ imageUrl: removed.imageUrl, cloudinaryId: removed.cloudinaryId });
  };

  // Closing the flow without saving.
  useEffect(() => discardImage, []);

  const reset = (nextNotice = null) => {
    runRef.current += 1;
    discardImage();

    setStep("pick");
    setPhoto(null);
    setNotice(nextNotice);
    setError("");
    setResult(null);
    setImage(null);
    setSavedItem(null);
  };

  const analysePhoto = async (picked) => {
    reset();

    const run = runRef.current;
    const isCurrent = () => run === runRef.current;

    setPhoto(picked);
    setStep("analysing");

    try {
      const uploaded = await uploadImageToCloudinary(picked);
      const uploadedImage = { imageUrl: uploaded.secure_url, cloudinaryId: uploaded.public_id };

      if (!isCurrent()) {
        deleteUnusedImage(uploadedImage.cloudinaryId);
        return;
      }

      unsavedImagesRef.current = [uploadedImage.cloudinaryId];
      setImage(uploadedImage);

      const analysis = await analyseItemPhoto(uploadedImage.cloudinaryId);

      if (!isCurrent()) {
        (analysis.image?.createdIds || []).forEach((publicId) => deleteUnusedImage(publicId));
        return;
      }

      takeRemovedImage(analysis.image);

      if (analysis.status !== "ok") {
        reset(analysis.status === "none" ? "none" : "multiple");
        return;
      }

      setResult({ kind: analysis.kind, fields: analysis.fields });
      setStep("ready");
    } catch (err) {
      if (!isCurrent()) return;

      console.error("Photo analysis error:", err, err.response?.data);

      // The background may have been removed before the analysis failed.
      takeRemovedImage(err.response?.data?.image);

      // Not even uploaded: nothing to fill in by hand yet.
      if (!unsavedImagesRef.current.length) {
        setPhoto(null);
        setStep("pick");
        setError(getErrorMessage(err, "Couldn't upload the photo. Please try again."));
        return;
      }

      setError(failureMessage(err));
      setStep("failed");
    }
  };

  const markSaved = (saved, kind) => {
    // Saved with this photo: the item now uses all its images (the
    // background-removed one, its thumbnail and the original). The manual
    // form may have saved it with another photo instead.
    if (unsavedImagesRef.current.includes(saved.cloudinaryId)) {
      unsavedImagesRef.current = [];
    } else {
      discardImage();
    }

    setSavedItem({
      id: saved._id,
      name: saved.name,
      kind,
      hasMatches: WARDROBE_KINDS[kind].hasMatches,
      message: WARDROBE_KINDS[kind].savedMessages.added,
    });
    setStep("saved");
  };

  // The analysis took clothing for footwear (or the other way round): the
  // review starts again as the other kind, keeping what the user has so
  // far (`fields`, the form's) except the type, which they choose again.
  const switchKind = (fields) => {
    if (!result) return;

    setResult({
      kind: result.kind === "clothing" ? "footwear" : "clothing",
      fields: { ...fields, subtype: "", type: "" },
    });
  };

  return {
    step,
    photo,
    notice,
    noticeText: notice ? NOTICES[notice] : "",
    dismissNotice: () => setNotice(null),
    error,

    analysePhoto,
    restart: () => reset(),

    kind: result?.kind || null,
    switchKind,
    // The photo to show: background removed once analysed.
    imageUrl: image?.imageUrl || null,
    // For the item form: the analysis, editable before saving.
    reviewPrefill: result
      ? { fields: { ...result.fields, ...image }, fromAnalysis: true }
      : null,
    // For the item form after a failed analysis: just the photo.
    manualPrefill: image ? { fields: { ...image }, fromAnalysis: false } : null,

    // The review (or, after a failed analysis, the manual) form saved it.
    markSaved,
    savedItem,
  };
};
