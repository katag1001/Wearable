import { useEffect, useRef, useState } from "react";

import { analyseItemPhoto } from "../api/analysis.js";
import { getErrorMessage } from "../api/errors.js";
import { deleteUnusedImage, uploadImageToCloudinary } from "../api/images.js";
import { WARDROBE_KINDS } from "../wardrobe/itemKinds.js";

/*
 * Adding an item from its photo alone (shared by the web and mobile apps).
 * The photo is uploaded to Cloudinary, then the server fills in everything
 * else - clothing or footwear, name, type, colours, pattern, fabric, tags
 * (server/services/itemAnalysisService.js).
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
 * The uploaded photo is deleted again if the item is never saved - when
 * another photo is chosen, the flow restarts, or it's closed (unmount).
 * The server only deletes images no item uses, so that's always safe.
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
  // { imageUrl, cloudinaryId } once uploaded.
  const [image, setImage] = useState(null);
  const [savedItem, setSavedItem] = useState(null);

  // Ignores an analysis that finishes after the user moved on.
  const runRef = useRef(0);
  // The uploaded image while no saved item uses it.
  const unsavedImageRef = useRef(null);

  const discardImage = () => {
    const publicId = unsavedImageRef.current;

    unsavedImageRef.current = null;

    if (publicId) {
      deleteUnusedImage(publicId);
    }
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

      unsavedImageRef.current = uploadedImage.cloudinaryId;
      setImage(uploadedImage);

      const analysis = await analyseItemPhoto(uploadedImage.cloudinaryId);

      if (!isCurrent()) return;

      if (analysis.status !== "ok") {
        reset(analysis.status === "none" ? "none" : "multiple");
        return;
      }

      setResult({ kind: analysis.kind, fields: analysis.fields });
      setStep("ready");
    } catch (err) {
      if (!isCurrent()) return;

      console.error("Photo analysis error:", err, err.response?.data);

      // Not even uploaded: nothing to fill in by hand yet.
      if (!unsavedImageRef.current) {
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
    // The review form may have saved it with another photo.
    if (saved.cloudinaryId !== unsavedImageRef.current) {
      discardImage();
    }

    unsavedImageRef.current = null;

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
