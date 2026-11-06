import { useState } from "react";

import { updatePreferences } from "../api/preferences.js";
import { emptyWeeklyTags } from "../constants/weekDays.js";
import { layeringOptions, smartCasualOption } from "../constants/pairingQuestions.js";
import { DEFAULT_SEASONALITY_ANSWER, styleImagesFor } from "../constants/styleQuizOptions.js";
import { buildQuizPreferences } from "../styleQuiz/quizAnswers.js";
import { asksPairingQuestions, getQuizSteps } from "../styleQuiz/quizSteps.js";

/*
 * The style quiz a new user takes: gender → style images → layering
 * (some genders only) → weekly tags → seasonality (1-5) → temperature,
 * which saves everything. Favourite palettes aren't asked here - they're
 * set on Style Preferences. `onComplete` runs once the answers are saved.
 */
export const useStyleQuiz = ({ onComplete } = {}) => {
  const [step, setStep] = useState("gender");
  const [gender, setGender] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [likesSmartCasual, setLikesSmartCasual] = useState(false);
  const [layeredTops, setLayeredTops] = useState([]);
  const [layeringAnswered, setLayeringAnswered] = useState(false);
  const [weeklyTags, setWeeklyTags] = useState(emptyWeeklyTags);
  const [seasonality, setSeasonality] = useState(DEFAULT_SEASONALITY_ANSWER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* -------------------- Moving between steps -------------------- */

  const moveBy = (offset) => {
    const steps = getQuizSteps(gender);

    setStep(steps[steps.indexOf(step) + offset]);
    setError("");
  };

  const goToNextStep = () => moveBy(1);
  const goBack = () => moveBy(-1);

  /* -------------------- Gender -------------------- */

  const chooseGender = (value) => {
    setGender(value);
    setError("");
    setStep("images");
  };

  /* -------------------- Style images -------------------- */

  // Only the images for the chosen gender.
  const imageOptions = styleImagesFor(gender);

  const toggleImage = (key) => {
    setSelectedImages((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key]
    );

    setError("");
  };

  // The smart-and-casual tile sits with the style images for the genders
  // asked pairing questions. It's a pairing answer, not a style image, so
  // it never counts towards colour or pattern.
  const showSmartCasual = asksPairingQuestions(gender);

  const toggleSmartCasual = () => {
    setLikesSmartCasual((current) => !current);
  };

  /* -------------------- Layering -------------------- */
  // Tick all that apply. Next answers every option (ticked or not);
  // Skip answers none of them.

  const toggleLayering = (key) => {
    setLayeredTops((current) =>
      current.includes(key)
        ? current.filter((tickedKey) => tickedKey !== key)
        : [...current, key]
    );
  };

  const finishLayering = () => {
    setLayeringAnswered(true);
    goToNextStep();
  };

  const skipLayering = () => {
    setLayeringAnswered(false);
    goToNextStep();
  };

  /* -------------------- Weekly tags -------------------- */

  const setWeeklyTag = (dayKey, tagName) => {
    setWeeklyTags((current) => ({ ...current, [dayKey]: tagName }));
  };

  /* -------------------- Temperature (saves) -------------------- */

  const finish = async (temperature) => {
    try {
      setSaving(true);
      setError("");

      await updatePreferences(
        buildQuizPreferences({
          gender,
          selectedImages,
          likesSmartCasual,
          layeredTops,
          layeringAnswered,
          weeklyTags,
          seasonality,
          temperature,
        })
      );

      onComplete?.();
    } catch {
      setError("Failed to save your answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    step,
    goToNextStep,
    goBack,
    saving,
    error,

    gender,
    chooseGender,

    imageOptions,
    selectedImages,
    toggleImage,

    showSmartCasual,
    smartCasualOption,
    likesSmartCasual,
    toggleSmartCasual,

    layeringOptions,
    layeredTops,
    toggleLayering,
    finishLayering,
    skipLayering,

    weeklyTags,
    setWeeklyTag,

    seasonality,
    setSeasonality,

    finish,
  };
};
