import { useEffect, useRef, useState } from "react";

import { analyseItemPhoto, removeItemPhotoBackground } from "../api/analysis.js";
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
 * `cutOut` (the phone only - mobile/src/platform/garmentCutout.js; see
 * context/phone-cutout-plan.md): the phone cuts the garment out FIRST and
 * uploads the cut-out, and the server doesn't remove anything. If the
 * phone can't, the photo as taken is uploaded and the server asks
 * Cloudinary - unless `cloudinaryBackup` is false (the strict test build),
 * when it's used as it is. `cutoutFailure` says why the phone couldn't.
 * The web passes no `cutOut` and works as before.
 *
 * `useAi` false (the user opted out of AI analysis - useAiConsent /
 * Settings): nothing goes to Gemini, and the user fills the item in
 * themselves ("manual"). The server only removes the background, when the
 * phone didn't.
 *
 * Steps:
 *   "pick"      - waiting for a photo (`notice` says why a photo was turned
 *                 down: "multiple" items or "none")
 *   "analysing" - cutting out, uploading and analysing - or, without AI,
 *                 just the background (a loading screen)
 *   "ready"     - analysed: the user checks what was found, changes
 *                 anything, and saves - an item form filled in from the
 *                 analysis (`reviewPrefill`; useAnalysedItemReview), which
 *                 calls markSaved
 *   "manual"    - without AI: the user fills the form in, with the
 *                 background-removed photo attached (`manualPrefill`)
 *   "failed"    - couldn't analyse (`error`): the user fills the form in,
 *                 with the photo already attached (`manualPrefill`)
 *   "saved"     - `savedItem` { id, name, kind, hasMatches, message }
 *
 * Whenever the background was removed (by the phone or Cloudinary),
 * `photoChoice` lets the user swap to the photo as taken and back - just
 * the image, nothing is analysed again. On the phone the photo as taken is
 * only uploaded then, the first time it's chosen.
 *
 * Every uploaded image the saved item doesn't use is deleted again - and
 * all of them if the item is never saved: when another photo is chosen,
 * the flow restarts, or it's closed (unmount). The server only deletes
 * images no item uses, so that's always safe.
 */

export const NOTICES = {
  multiple:
    "We spotted more than one item in this photo. Please choose a photo of just one item.",
  none: "We couldn't see any clothing or footwear in this photo. Please try another one.",
};

const failureMessage = (err, useAi) => {
  const code = err.response?.data?.code;

  if (code === "daily_limit") return getErrorMessage(err, "");
  if (code === "ai_opted_out") return "AI analysis is turned off in Settings. You can fill in the details yourself.";

  return useAi
    ? "We couldn't analyse this photo. You can fill in the details yourself."
    : "We couldn't process this photo. You can fill in the details yourself.";
};

const toImage = (uploaded) => ({ imageUrl: uploaded.secure_url, cloudinaryId: uploaded.public_id });

const NO_IMAGES = { original: null, cutout: null };

export const usePhotoAnalysis = ({ useAi = true, cutOut = null, cloudinaryBackup = true } = {}) => {
  const [step, setStep] = useState("pick");
  // The chosen photo (a File on the web, { uri, name, type } on a phone).
  const [photo, setPhoto] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");
  // { kind, fields } from the server.
  const [result, setResult] = useState(null);
  // The uploaded images ({ imageUrl, cloudinaryId }): the photo as taken
  // (on the phone, only once it's needed) and the background-removed one
  // (the phone's or Cloudinary's), if any.
  const [images, setImages] = useState(NO_IMAGES);
  // The user chose the photo as taken over the cut-out.
  const [usingOriginal, setUsingOriginal] = useState(false);
  // Uploading the photo as taken, after the user chose it.
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState("");
  // Why the phone couldn't cut the photo out ({ reason, ... }), or null.
  const [cutoutFailure, setCutoutFailure] = useState(null);
  const [savedItem, setSavedItem] = useState(null);

  // Ignores an analysis that finishes after the user moved on.
  const runRef = useRef(0);
  // Every image uploaded or made for this photo (the photo as taken, the
  // cut-out, Cloudinary's thumbnail) while no saved item uses them.
  const unsavedImagesRef = useRef([]);

  // The image shown and saved.
  const image = usingOriginal || !images.cutout ? images.original : images.cutout;

  const discardImage = () => {
    const publicIds = unsavedImagesRef.current;

    unsavedImagesRef.current = [];

    publicIds.forEach((publicId) => deleteUnusedImage(publicId));
  };

  const trackUnsaved = (publicIds) => {
    unsavedImagesRef.current = [...unsavedImagesRef.current, ...publicIds];
  };

  // The server's background-removed photo (`removed`, or null if it
  // couldn't be made): shown and saved instead of the upload.
  const takeRemovedImage = (removed) => {
    if (!removed?.cloudinaryId) return;

    trackUnsaved(removed.createdIds || [removed.cloudinaryId]);
    setImages((current) => ({
      ...current,
      cutout: { imageUrl: removed.imageUrl, cloudinaryId: removed.cloudinaryId },
    }));
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
    setImages(NO_IMAGES);
    setUsingOriginal(false);
    setSwapping(false);
    setSwapError("");
    setCutoutFailure(null);
    setSavedItem(null);
  };

  const analysePhoto = async (picked) => {
    reset();

    const run = runRef.current;
    const isCurrent = () => run === runRef.current;

    setPhoto(picked);
    setStep("analysing");

    try {
      // The phone's cut-out, if it can.
      let phoneCutout = null;
      let failure = null;

      if (cutOut) {
        const attempt = await cutOut(picked);

        if (!isCurrent()) return;

        phoneCutout = attempt.image;
        failure = attempt.image ? null : attempt.failure || { reason: "unknown" };
        setCutoutFailure(failure);
      }

      const uploaded = toImage(await uploadImageToCloudinary(phoneCutout || picked));

      if (!isCurrent()) {
        deleteUnusedImage(uploaded.cloudinaryId);
        return;
      }

      unsavedImagesRef.current = [uploaded.cloudinaryId];
      setImages(phoneCutout ? { original: null, cutout: uploaded } : { original: uploaded, cutout: null });

      // What the server does about the background.
      const options = !cutOut
        ? {}
        : phoneCutout
          ? { background: "phone" }
          : { ...(!cloudinaryBackup && { background: "keep" }), cutoutFailure: failure };

      // Whether the server still has to remove the background.
      const serverRemoves = !phoneCutout && (!cutOut || cloudinaryBackup);

      if (!useAi) {
        if (serverRemoves) {
          const processed = await removeItemPhotoBackground(uploaded.cloudinaryId, options);

          if (!isCurrent()) {
            (processed.image?.createdIds || []).forEach((publicId) => deleteUnusedImage(publicId));
            return;
          }

          takeRemovedImage(processed.image);
        }

        setStep("manual");
        return;
      }

      const analysis = await analyseItemPhoto(uploaded.cloudinaryId, options);

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

      setError(failureMessage(err, useAi));
      setStep("failed");
    }
  };

  // "Use original photo": the photo as taken instead of the cut-out -
  // uploaded now if it wasn't yet (the phone's cut-out). Nothing is
  // analysed again.
  const chooseOriginal = async () => {
    if (swapping) return;

    setSwapError("");

    if (images.original) {
      setUsingOriginal(true);
      return;
    }

    if (!photo) return;

    const run = runRef.current;
    setSwapping(true);

    try {
      const uploaded = toImage(await uploadImageToCloudinary(photo));

      if (run !== runRef.current) {
        deleteUnusedImage(uploaded.cloudinaryId);
        return;
      }

      trackUnsaved([uploaded.cloudinaryId]);
      setImages((current) => ({ ...current, original: uploaded }));
      setUsingOriginal(true);
    } catch (err) {
      if (run !== runRef.current) return;

      console.error("Original photo upload error:", err);
      setSwapError("Couldn't upload the original photo. Please try again.");
    } finally {
      if (run === runRef.current) setSwapping(false);
    }
  };

  const chooseCutout = () => {
    setSwapError("");
    setUsingOriginal(false);
  };

  const markSaved = (saved, kind) => {
    // Every image the saved item uses (shown, thumbnail, original) stays;
    // the rest - e.g. the cut-out the user swapped away from, or every one
    // if the manual form saved another photo instead - is deleted.
    const used = [saved.cloudinaryId, saved.thumbnailCloudinaryId, saved.originalCloudinaryId].filter(Boolean);
    const unused = unsavedImagesRef.current.filter((publicId) => !used.includes(publicId));

    unsavedImagesRef.current = [];
    unused.forEach((publicId) => deleteUnusedImage(publicId));

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
    // The photo to show: background removed once analysed (unless the
    // user chose the original).
    imageUrl: image?.imageUrl || null,
    // { imageUrl, cloudinaryId } - the image the item is saved with.
    image,
    // Swapping between the cut-out and the photo as taken, or null when
    // there's no cut-out to swap with.
    photoChoice: images.cutout
      ? {
          usingOriginal,
          swapping,
          error: swapError,
          chooseOriginal,
          chooseCutout,
        }
      : null,
    // Why the phone couldn't cut the photo out ({ reason, platform,
    // osVersion }), or null. Only shown in the strict test build.
    cutoutFailure,
    // For the item form: the analysis, editable before saving.
    reviewPrefill: result
      ? { fields: { ...result.fields, ...image }, fromAnalysis: true }
      : null,
    // For the item form without AI, or after a failed analysis: just the photo.
    manualPrefill: image ? { fields: { ...image }, fromAnalysis: false } : null,

    // The review (or, after a failed analysis, the manual) form saved it.
    markSaved,
    savedItem,
  };
};
