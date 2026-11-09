// Style preferences: a retake of the style quiz - the same steps as a new
// user's (StyleQuizSteps) apart from the weekly tags, each with a Skip
// that keeps the saved answer. Starts from the saved answers; nothing is
// saved until Finish. Leaving before then asks first, and so does
// finishing with a new gender (it rebuilds every outfit and resets the
// learned pairings).
//
// Finish goes back to Profile. Any outfit rebuild the change needs - and
// building today's list again - carries on in the background
// (OutfitRebuildProvider). Logic: useStyleQuiz (shared with the web).

import { useEffect, useState } from "react";
import { router, usePreventRemove } from "expo-router";

import { getPreferences } from "@core/api/preferences.js";
import { useStyleQuiz } from "@core/hooks/useStyleQuiz.js";

import { StyleQuizSteps } from "../../../../components/styleQuiz/StyleQuizSteps";
import { Loading, Message, Screen } from "../../../../components/ui";
import { useOutfitRebuild } from "../../../../outfitRebuild/OutfitRebuildProvider";
import { showDialog } from "../../../../components/soft/Dialog";

// Resolves true to go ahead with the new gender.
const confirmGenderChange = () =>
  new Promise((resolve) => {
    showDialog(
      "Change how you dress?",
      "This rebuilds all your outfits and resets what the app has learned about the pairings you like.",
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Continue", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });

const TITLE = "Style preferences";

export default function StylePreferencesScreen() {
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPreferences()
      .then(({ data }) => setSaved(data))
      .catch((err) => {
        console.error("Failed to load preferences:", err);
        setError("Couldn't load your preferences. Please try again.");
      });
  }, []);

  if (error) {
    return (
      <Screen pageTitle={TITLE} onBack={() => router.back()}>
        <Message text={error} />
      </Screen>
    );
  }

  if (!saved) {
    return (
      <Screen pageTitle={TITLE} onBack={() => router.back()} scroll={false}>
        <Loading text="Loading your preferences…" />
      </Screen>
    );
  }

  return <StyleRetake saved={saved} />;
}

// Mounted once the saved answers are in, so the quiz starts from them.
function StyleRetake({ saved }) {
  const { start } = useOutfitRebuild();
  const [finished, setFinished] = useState(false);

  // The header's back arrow, Android's back button and swiping back.
  // `repeat` turns the check off and leaves.
  const allowLeaving = usePreventRemove(!finished, ({ repeat }) => {
    showDialog(
      "Leave without saving?",
      "Your preferences aren't saved until you finish the quiz.",
      [
        { text: "Keep going", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: repeat },
      ]
    );
  });

  const quiz = useStyleQuiz({
    retake: true,
    saved,
    confirmGenderChange,
    onComplete: (result) => {
      start(result);
      // Saved: back to Profile without asking.
      allowLeaving();
      setFinished(true);
      router.back();
    },
  });

  return (
    <StyleQuizSteps quiz={quiz} pageTitle={TITLE} onBack={() => router.back()} />
  );
}
