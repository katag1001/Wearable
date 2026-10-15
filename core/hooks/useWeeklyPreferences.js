import { useEffect, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { getPreferences, updatePreferences } from "../api/preferences.js";
import { emptyWeeklyTags, weekDays } from "../constants/weekDays.js";
import { useFlashMessage } from "./useFlashMessage.js";

// Just the seven day fields from a preferences document.
const pickWeeklyTags = (preferences) =>
  Object.fromEntries(
    weekDays.map(({ key }) => [key, preferences?.[key] ?? null])
  );

/*
 * The Weekly Preferences screen: a tag per weekday, used to pick today's
 * outfits. Edits stay local until `save`.
 */
export const useWeeklyPreferences = () => {
  const [weeklyTags, setWeeklyTags] = useState(emptyWeeklyTags);
  const [selectedDay, setSelectedDay] = useState(weekDays[0].key);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const success = useFlashMessage();

  useEffect(() => {
    const fetchWeeklyTags = async () => {
      try {
        const { data } = await getPreferences();

        setWeeklyTags(pickWeeklyTags(data));
      } catch (err) {
        // 404: nothing saved yet - start empty.
        if (err.response?.status !== 404) {
          console.error("Error fetching preferences:", err);

          setError(getErrorMessage(err, "Failed to load preferences."));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyTags();
  }, []);

  const clearMessages = () => {
    setError("");
    success.clear();
  };

  const selectDay = (dayKey) => {
    setSelectedDay(dayKey);
    clearMessages();
  };

  const setSelectedDayTag = (tagName) => {
    setWeeklyTags((current) => ({ ...current, [selectedDay]: tagName }));
    clearMessages();
  };

  const selectTag = (tagName) => setSelectedDayTag(tagName);
  const clearDay = () => setSelectedDayTag(null);

  const save = async () => {
    try {
      setSaving(true);
      clearMessages();

      const { data } = await updatePreferences(weeklyTags);

      if (data) {
        setWeeklyTags(pickWeeklyTags(data));
      }

      success.show("Preferences saved successfully.");
    } catch (err) {
      console.error("Error saving preferences:", err);

      setError(getErrorMessage(err, "Failed to save preferences."));
    } finally {
      setSaving(false);
    }
  };

  return {
    weeklyTags,
    selectedDay,
    selectedDayLabel: weekDays.find((day) => day.key === selectedDay)?.label,
    selectDay,
    selectTag,
    clearDay,
    save,
    loading,
    saving,
    error,
    success: success.message,
  };
};
