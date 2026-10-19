import { useEffect, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { getPreferences, updatePreferences } from "../api/preferences.js";
import { asksPairingQuestions } from "../styleQuiz/quizSteps.js";
import { favouritePaletteOptions, toggleFavouritePalette } from "../utils/colourPalettes.js";
import { resolveStyleQuiz } from "../utils/resolveStyleQuiz.js";
import { useFlashMessage } from "./useFlashMessage.js";

/*
 * The Style Preferences screen: change the style quiz answers later.
 *
 * Gender, temperature and favourite palettes load from the saved
 * preferences. The style images and pairing questions always start blank
 * (the answers aren't stored, only their effect): images update colour +
 * pattern only if any are picked, and only answered pairing questions are
 * sent.
 */
export const useStylePreferences = () => {
  const [gender, setGender] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [savedColour, setSavedColour] = useState(null);
  const [favouritePalettes, setFavouritePalettes] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [pairingAnswers, setPairingAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const success = useFlashMessage();

  useEffect(() => {
    const fetchStylePreferences = async () => {
      try {
        const { data } = await getPreferences();

        setGender(data?.gender ?? null);
        setTemperature(data?.temperature ?? null);
        setSavedColour(data?.colour ?? null);
        setFavouritePalettes(data?.favouritePalettes ?? []);
      } catch (err) {
        // 404: nothing saved yet - leave everything unset.
        if (err.response?.status !== 404) {
          setError(getErrorMessage(err, "Failed to load preferences."));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStylePreferences();
  }, []);

  const clearMessages = () => {
    setError("");
    success.clear();
  };

  const chooseGender = (value) => {
    setGender(value);
    clearMessages();
  };

  const chooseTemperature = (value) => {
    setTemperature(value);
    clearMessages();
  };

  const toggleImage = (key) => {
    setSelectedImages((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key]
    );

    clearMessages();
  };

  // A null answer clears the question, so it isn't sent.
  const answerPairing = (questionKey, answer) => {
    setPairingAnswers((current) => {
      const { [questionKey]: _removed, ...rest } = current;
      return answer ? { ...rest, [questionKey]: answer } : rest;
    });

    clearMessages();
  };

  // Palettes are offered at the colour level the newly picked images give,
  // or the saved level if none are picked.
  const paletteOptions = favouritePaletteOptions(
    selectedImages.length > 0 ? resolveStyleQuiz(selectedImages).colour : savedColour,
    favouritePalettes
  );

  const togglePalette = (id) => {
    setFavouritePalettes((current) => toggleFavouritePalette(current, id));
    clearMessages();
  };

  const showPairingQuestions = asksPairingQuestions(gender);

  const buildChanges = () => {
    const changes = { gender, temperature, favouritePalettes };

    if (selectedImages.length > 0) {
      Object.assign(changes, resolveStyleQuiz(selectedImages));
    }

    if (showPairingQuestions && Object.keys(pairingAnswers).length > 0) {
      changes.pairingAnswers = pairingAnswers;
    }

    return changes;
  };

  const save = async () => {
    try {
      setSaving(true);
      clearMessages();

      const changes = buildChanges();

      await updatePreferences(changes);

      if (changes.colour) {
        setSavedColour(changes.colour);
      }

      setSelectedImages([]);
      setPairingAnswers({});
      success.show("Preferences saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save preferences."));
    } finally {
      setSaving(false);
    }
  };

  return {
    gender,
    chooseGender,
    temperature,
    chooseTemperature,
    selectedImages,
    toggleImage,
    paletteOptions,
    favouritePalettes,
    togglePalette,
    pairingAnswers,
    answerPairing,
    showPairingQuestions,
    save,
    loading,
    saving,
    error,
    success: success.message,
  };
};
