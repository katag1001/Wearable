import { useEffect, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { getPreferences, updatePreferences } from "../api/preferences.js";

/*
 * The AI consent prompt in front of adding an item (shared by the web and
 * mobile apps). Until the user has answered (Preferences.aiAnalysis is
 * null) the prompt can't be skipped - no item can be added. Once they
 * answer, it's saved and a "Preference saved!" message shows until
 * `acknowledge`; then the add flow opens. Never shown again after that -
 * the choice is changed in Settings (useAiSettings).
 *
 *   loading      - reading the saved choice
 *   choice       - true (use AI), false (fill in by hand) or null
 *   showPrompt   - the question is on screen
 *   showSaved    - the "Preference saved!" message is on screen
 */
export const useAiConsent = () => {
  const [choice, setChoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChoice = async () => {
      try {
        const { data } = await getPreferences();

        setChoice(typeof data?.aiAnalysis === "boolean" ? data.aiAnalysis : null);
      } catch (err) {
        // 404: no preferences yet - not answered.
        if (err.response?.status !== 404) {
          console.error("Error fetching AI choice:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChoice();
  }, []);

  const answer = async (value) => {
    try {
      setSaving(true);
      setError("");

      await updatePreferences({ aiAnalysis: value });

      setChoice(value);
      setJustSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save your choice. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    choice,
    showPrompt: !loading && choice === null,
    showSaved: justSaved,
    answer,
    acknowledge: () => setJustSaved(false),
    saving,
    error,
  };
};
