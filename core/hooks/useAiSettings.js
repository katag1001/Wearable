import { useEffect, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { getPreferences, updatePreferences } from "../api/preferences.js";
import { photosUsedToday } from "../constants/aiAnalysis.js";
import { useFlashMessage } from "./useFlashMessage.js";

/*
 * The Settings screen: whether AI analyses new item photos
 * (Preferences.aiAnalysis), saved as soon as it's changed, and how many
 * photos were added today. The first answer comes from the consent prompt
 * (useAiConsent); null here means it hasn't been answered yet.
 */
export const useAiSettings = () => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [usedToday, setUsedToday] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const success = useFlashMessage();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getPreferences();

        setAiAnalysis(typeof data?.aiAnalysis === "boolean" ? data.aiAnalysis : null);
        setUsedToday(photosUsedToday(data));
      } catch (err) {
        // 404: nothing saved yet.
        if (err.response?.status !== 404) {
          setError(getErrorMessage(err, "Failed to load settings."));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const changeAiAnalysis = async (value) => {
    if (saving || value === aiAnalysis) return;

    const previous = aiAnalysis;

    try {
      setSaving(true);
      setError("");
      success.clear();
      setAiAnalysis(value);

      await updatePreferences({ aiAnalysis: value });

      success.show("Preference saved.");
    } catch (err) {
      setAiAnalysis(previous);
      setError(getErrorMessage(err, "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  };

  return {
    aiAnalysis,
    changeAiAnalysis,
    usedToday,
    loading,
    saving,
    error,
    success: success.message,
  };
};
