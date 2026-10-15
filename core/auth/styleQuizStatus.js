// core/auth/styleQuizStatus.js
//
// A new user takes the style quiz before anything else. It counts as done
// once their preferences have every answer the matching needs.

import { getPreferences } from "../api/preferences.js";

export const isStyleQuizComplete = (preferences) =>
  Boolean(
    preferences?.gender &&
      preferences?.colour &&
      preferences?.pattern &&
      preferences?.temperature
  );

// true / false, or null when it couldn't be checked (the caller keeps
// what it had). No preferences saved at all (404) means the quiz is needed.
// Checked once per login / session restore, not on every screen.
export const checkNeedsStyleQuiz = async () => {
  try {
    const { data } = await getPreferences();

    return !isStyleQuizComplete(data);
  } catch (err) {
    if (err.response?.status === 404) {
      return true;
    }

    console.error("Failed to check style quiz status:", err);

    return null;
  }
};
