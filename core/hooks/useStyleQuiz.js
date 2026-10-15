import { useState } from "react";

import { updatePreferences } from "../api/preferences.js";
import { emptyWeeklyTags } from "../constants/weekDays.js";
import { pairingQuestions } from "../constants/pairingQuestions.js";
import { styleImageOptions } from "../constants/styleQuizOptions.js";
import { buildQuizPreferences } from "../styleQuiz/quizAnswers.js";
import { getQuizSteps } from "../styleQuiz/quizSteps.js";

/*
 * The style quiz a new user takes: gender → style images → pairing
 * questions (some genders only) → weekly tags → temperature, which saves
 * everything. `onComplete` runs once the answers are saved.
 */
export const useStyleQuiz = ({ onComplete } = {}) => {
  const [step, setStep] = useState("gender");
  const [gender, setGender] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [pairingAnswers, setPairingAnswers] = useState({});
  const [pairingIndex, setPairingIndex] = useState(0);
  const [weeklyTags, setWeeklyTags] = useState(emptyWeeklyTags);
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
  const imageOptions = styleImageOptions.filter((option) =>
    option.gender.includes(gender)
  );

  const toggleImage = (key) => {
    setSelectedImages((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key]
    );

    setError("");
  };

  /* -------------------- Pairing questions -------------------- */
  // One question at a time. Answering moves to the next question, or the
  // next step after the last. Back goes to the previous question, or out
  // of the step from the first.

  const pairingQuestion = pairingQuestions[pairingIndex];

  const answerPairing = (value) => {
    setPairingAnswers((current) => ({
      ...current,
      [pairingQuestion.key]: value,
    }));

    if (pairingIndex < pairingQuestions.length - 1) {
      setPairingIndex(pairingIndex + 1);
    } else {
      goToNextStep();
    }
  };

  const backFromPairing = () => {
    if (pairingIndex > 0) {
      setPairingIndex(pairingIndex - 1);
    } else {
      goBack();
    }
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
          pairingAnswers,
          weeklyTags,
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

    pairingQuestion,
    pairingAnswer: pairingAnswers[pairingQuestion.key],
    answerPairing,
    backFromPairing,

    weeklyTags,
    setWeeklyTag,

    finish,
  };
};
