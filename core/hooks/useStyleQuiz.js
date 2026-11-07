import { useState } from "react";

import { updatePreferences } from "../api/preferences.js";
import { getErrorMessage } from "../api/errors.js";
import { emptyWeeklyTags } from "../constants/weekDays.js";
import { layeringOptions, smartCasualOption } from "../constants/pairingQuestions.js";
import {
  DEFAULT_SEASONALITY_ANSWER,
  DEFAULT_TEMPERATURE_ANSWER,
  DEFAULT_TRENDS_ANSWER,
  styleImagesFor,
} from "../constants/styleQuizOptions.js";
import { buildQuizPreferences } from "../styleQuiz/quizAnswers.js";
import { colourFamilies, toggleColourFamily } from "../utils/colourPalettes.js";
import { asksPairingQuestions, getQuizSteps } from "../styleQuiz/quizSteps.js";

/*
 * The style quiz a new user takes: gender → temperature (1-5) → style
 * images → favourite colour families (up to 3, optional) → layering (some
 * genders only) → weekly tags → seasonality (1-5) → trends (1-5,
 * optional), whose Finish (or Skip) saves everything. `onComplete` runs
 * once the answers are saved, with the server's answer (its
 * `outfitRebuild` and `refreshToday` - see updatePreferences on the server).
 *
 * `retake`: Style Preferences' retake, starting from the `saved`
 * preferences. There's no weekly step, and every step can be skipped -
 * Skip keeps the saved answer, so it's the same as Next on the steps that
 * start filled in. The style pictures and layering aren't saved, so they
 * start blank, and skipping them keeps what's saved too. Finish with a
 * new gender asks `confirmGenderChange` (resolves true to go ahead) first.
 */
export const useStyleQuiz = ({
  onComplete,
  retake = false,
  saved = null,
  confirmGenderChange,
} = {}) => {
  const start = retake ? saved || {} : {};

  const [step, setStep] = useState("gender");
  const [gender, setGender] = useState(start.gender ?? null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [favouriteColourFamilies, setFavouriteColourFamilies] = useState(
    start.favouriteColourFamilies ?? []
  );
  const [likesSmartCasual, setLikesSmartCasual] = useState(false);
  const [layeredTops, setLayeredTops] = useState([]);
  const [layeringAnswered, setLayeringAnswered] = useState(false);
  const [weeklyTags, setWeeklyTags] = useState(emptyWeeklyTags);
  const [temperature, setTemperature] = useState(start.temperature ?? DEFAULT_TEMPERATURE_ANSWER);
  const [seasonality, setSeasonality] = useState(start.seasonality ?? DEFAULT_SEASONALITY_ANSWER);
  const [trends, setTrends] = useState(start.trends ?? DEFAULT_TRENDS_ANSWER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* -------------------- Moving between steps -------------------- */

  // `forGender`: the gender the steps are for, when it's just been changed
  // (skipping the gender step puts the saved one back).
  const moveBy = (offset, forGender = gender) => {
    const steps = getQuizSteps(forGender, { retake });

    setStep(steps[steps.indexOf(step) + offset]);
    setError("");
  };

  const goToNextStep = () => moveBy(1);
  const goBack = () => moveBy(-1);

  /* -------------------- Gender -------------------- */

  // Picking selects; Next moves on. A different gender shows different
  // style images, so any picked under the old one are dropped.
  const chooseGender = (value) => {
    if (value !== gender) {
      setSelectedImages([]);
      setLikesSmartCasual(false);
    }

    setGender(value);
    setError("");
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

  /* -------------------- Favourite colours -------------------- */
  // Up to 3 families. Skip saves none, even ones picked before skipping -
  // on a retake it keeps the saved ones.

  const pickColourFamily = (id) => {
    setFavouriteColourFamilies((current) => toggleColourFamily(current, id));
  };

  const skipColours = () => {
    setFavouriteColourFamilies(retake ? start.favouriteColourFamilies ?? [] : []);
    goToNextStep();
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

  // Skip saves no days, even ones picked before skipping.
  const skipWeekly = () => {
    setWeeklyTags(emptyWeeklyTags);
    goToNextStep();
  };

  /* -------------------- Skipping a retake's steps -------------------- */
  // Put the saved answer back and move on. Colours, layering and trends
  // have their own skips (skipColours / skipLayering / skipTrends).

  const skipGender = () => {
    chooseGender(start.gender ?? null);
    moveBy(1, start.gender ?? null);
  };

  const skipTemperature = () => {
    setTemperature(start.temperature ?? DEFAULT_TEMPERATURE_ANSWER);
    goToNextStep();
  };

  const skipImages = () => {
    setSelectedImages([]);
    setLikesSmartCasual(false);
    goToNextStep();
  };

  const skipSeasonality = () => {
    setSeasonality(start.seasonality ?? DEFAULT_SEASONALITY_ANSWER);
    goToNextStep();
  };

  /* -------------------- Finish (saves) -------------------- */
  // Skip on the trends step saves everything else, leaving trends
  // unanswered (no effect) - on a retake, as saved.

  const save = async ({ withTrends }) => {
    if (retake && gender !== start.gender && confirmGenderChange) {
      if (!(await confirmGenderChange())) return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await updatePreferences(
        buildQuizPreferences({
          gender,
          selectedImages,
          favouriteColourFamilies,
          likesSmartCasual,
          layeredTops,
          layeringAnswered,
          weeklyTags,
          seasonality,
          temperature,
          trends: withTrends ? trends : undefined,
          retake,
        })
      );

      onComplete?.(result);
    } catch (err) {
      // e.g. outfits still updating from the last change (409).
      setError(getErrorMessage(err, null) || "Failed to save your answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const finish = () => save({ withTrends: true });
  const skipTrends = () => save({ withTrends: false });

  return {
    step,
    goToNextStep,
    goBack,
    saving,
    error,

    retake,
    skipGender,
    skipTemperature,
    skipImages,
    skipSeasonality,

    gender,
    chooseGender,

    imageOptions,
    selectedImages,
    toggleImage,

    colourFamilies,
    favouriteColourFamilies,
    toggleColourFamily: pickColourFamily,
    skipColours,

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
    skipWeekly,

    temperature,
    setTemperature,

    seasonality,
    setSeasonality,

    trends,
    setTrends,
    skipTrends,

    finish,
  };
};
