import { useEffect, useRef, useState } from "react";

import { analyseItemPhoto } from "../api/analysis.js";
import { getErrorMessage } from "../api/errors.js";
import { discardPhotos, processPhoto, uploadPhoto } from "../api/images.js";
import { reportCutout } from "../images/cutoutNotice.js";
import { WARDROBE_KINDS } from "../wardrobe/itemKinds.js";

/*
 * Adding an item from its photo alone (the phone app).
 * The phone cuts the garment out first (`cutOut`:
 * mobile/src/platform/garmentCutout.js), uploads the cut-out (or, if it
 * couldn't, the photo as taken - then Cloudflare removes the background on
 * the server), and the server makes the item photo (two stored sizes) and
 * fills in everything else - clothing or footwear, name, type, colours,
 * pattern, fabric, tags (server/controllers/analysisControllers.js;
 * context/cloudflare-migration-plan.md).
 *
 * `useAi` false (the user opted out of AI analysis - useAiConsent /
 * Settings): nothing goes to Gemini; the server only makes the item photo,
 * and the user fills the item in themselves ("manual").
 *
 * Steps:
 *   "pick"      - waiting for a photo (`notice` says why a photo was turned
 *                 down: "multiple" items or "none")
 *   "analysing" - cutting out, uploading and analysing (a loading screen)
 *   "ready"     - analysed: the user checks what was found, changes
 *                 anything, and saves - an item form filled in from the
 *                 analysis (`reviewPrefill`; useAnalysedItemReview), which
 *                 calls markSaved
 *   "manual"    - without AI: the user fills the form in, with the photo
 *                 attached (`manualPrefill`)
 *   "failed"    - couldn't analyse (`error`): the user fills the form in,
 *                 with the photo already attached (`manualPrefill`)
 *   "saved"     - `savedItem` { id, name, kind, hasMatches, message }
 *
 * Whenever the background was removed (by the phone or Cloudflare),
 * `photoChoice` lets the user swap to the photo as taken and back - just
 * the image, nothing is analysed again. The photo as taken is only
 * uploaded then, the first time it's chosen.
 *
 * Every photo made that the saved item doesn't use is discarded - and all
 * of them if the item is never saved: when another photo is chosen, the
 * flow restarts, or it's closed (unmount). The server only deletes the
 * user's own photos no item uses, so that's always safe.
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

const NO_IMAGES = { original: null, cutout: null };

export const usePhotoAnalysis = ({ useAi = true, cutOut = null } = {}) => {
  const [step, setStep] = useState("pick");
  // The chosen photo ({ uri, name, type } on a phone).
  const [photo, setPhoto] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");
  // { kind, fields } from the server.
  const [result, setResult] = useState(null);
  // The item photos made ({ imageKey }): the photo as taken (only once
  // it's needed, unless the background couldn't be removed) and the one
  // with its background removed (the phone's or Cloudflare's), if any.
  const [images, setImages] = useState(NO_IMAGES);
  // The user chose the photo as taken over the cut-out.
  const [usingOriginal, setUsingOriginal] = useState(false);
  // Making the photo as taken, after the user chose it.
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState("");
  const [savedItem, setSavedItem] = useState(null);

  // Ignores work that finishes after the user moved on.
  const runRef = useRef(0);
  // Every item photo made for this photo while no saved item uses it.
  const unsavedImagesRef = useRef([]);

  // The photo shown and saved.
  const image = usingOriginal || !images.cutout ? images.original : images.cutout;

  const discardImage = () => {
    const imageKeys = unsavedImagesRef.current;

    unsavedImagesRef.current = [];

    discardPhotos(imageKeys);
  };

  // A photo the server made ({ imageKey, removedBy }): shown and saved.
  const takeImage = (made) => {
    if (!made?.imageKey) return;

    unsavedImagesRef.current = [...unsavedImagesRef.current, made.imageKey];
    setImages((current) =>
      made.removedBy
        ? { ...current, cutout: { imageKey: made.imageKey } }
        : { ...current, original: { imageKey: made.imageKey } }
    );
    reportCutout(made.removedBy);
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
    setSavedItem(null);
  };

  const analysePhoto = async (picked) => {
    reset();

    const run = runRef.current;
    const isCurrent = () => run === runRef.current;

    setPhoto(picked);
    setStep("analysing");

    let uploaded = false;

    try {
      // The phone's cut-out, if it can.
      let phoneCutout = null;
      let failure = null;

      if (cutOut) {
        const attempt = await cutOut(picked);

        if (!isCurrent()) return;

        phoneCutout = attempt.image;
        failure = attempt.image ? null : attempt.failure || { reason: "unknown" };
      }

      const uploadKey = await uploadPhoto(phoneCutout || picked);
      uploaded = true;

      if (!isCurrent()) return;

      // What the server does about the background: keep the phone's
      // cut-out, or Cloudflare removes it (with why the phone couldn't).
      const options = phoneCutout ? { background: "phone" } : { ...(failure && { cutoutFailure: failure }) };

      if (!useAi) {
        const made = await processPhoto(uploadKey, options);

        if (!isCurrent()) {
          discardPhotos([made?.imageKey]);
          return;
        }

        takeImage(made);
        setStep("manual");
        return;
      }

      const analysis = await analyseItemPhoto(uploadKey, options);

      if (!isCurrent()) {
        discardPhotos([analysis.image?.imageKey]);
        return;
      }

      takeImage(analysis.image);

      if (analysis.status !== "ok") {
        reset(analysis.status === "none" ? "none" : "multiple");
        return;
      }

      setResult({ kind: analysis.kind, fields: analysis.fields });
      setStep("ready");
    } catch (err) {
      if (!isCurrent()) return;

      console.error("Photo analysis error:", err, err.response?.data);

      // The photo may have been made before the analysis failed.
      takeImage(err.response?.data?.image);

      // No photo made: nothing to fill in by hand yet.
      if (!unsavedImagesRef.current.length) {
        setPhoto(null);
        setStep("pick");
        setError(
          getErrorMessage(err, uploaded ? "Couldn't process the photo. Please try again." : "Couldn't upload the photo. Please try again.")
        );
        return;
      }

      setError(failureMessage(err, useAi));
      setStep("failed");
    }
  };

  // "Use original photo": the photo as taken instead of the cut-out - made
  // now if it wasn't yet. Nothing is analysed again.
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
      const made = await processPhoto(await uploadPhoto(photo), { background: "none" });

      if (run !== runRef.current) {
        discardPhotos([made?.imageKey]);
        return;
      }

      unsavedImagesRef.current = [...unsavedImagesRef.current, made.imageKey];
      setImages((current) => ({ ...current, original: { imageKey: made.imageKey } }));
      setUsingOriginal(true);
    } catch (err) {
      if (run !== runRef.current) return;

      console.error("Original photo error:", err);
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
    // The photo the saved item uses stays; the rest - e.g. the cut-out the
    // user swapped away from, or every one if the manual form saved
    // another photo instead - is discarded.
    const unused = unsavedImagesRef.current.filter((imageKey) => imageKey !== saved.imageKey);

    unsavedImagesRef.current = [];
    discardPhotos(unused);

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
    // The item photo shown and saved ({ imageKey }), or null before
    // there is one.
    image,
    imageKey: image?.imageKey || null,
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
    // For the item form: the analysis, editable before saving.
    reviewPrefill: result ? { fields: { ...result.fields, ...image }, fromAnalysis: true } : null,
    // For the item form without AI, or after a failed analysis: just the photo.
    manualPrefill: image ? { fields: { ...image }, fromAnalysis: false } : null,

    // The review (or, after a failed analysis, the manual) form saved it.
    markSaved,
    savedItem,
  };
};
