// The style quiz gate: shown after login until the quiz is done (see
// _layout.jsx). The steps are StyleQuizSteps (the same screens as the
// retake on Style Preferences); the logic is useStyleQuiz, shared with the
// web. Saving it lifts the gate, and the root layout opens the tabs - where
// any outfit rebuild it starts is carried out (OutfitRebuildProvider).

import { useStyleQuiz } from "@core/hooks/useStyleQuiz.js";

import { useSession } from "../auth/SessionProvider";
import { StyleQuizSteps } from "../components/styleQuiz/StyleQuizSteps";
import { Button } from "../components/ui";

export default function StyleQuizScreen() {
  const { logout, completeStyleQuiz } = useSession();
  const quiz = useStyleQuiz({ onComplete: completeStyleQuiz });

  return (
    <StyleQuizSteps quiz={quiz} edges={["top", "bottom"]}>
      <Button label="Log out" variant="text" onPress={logout} />
    </StyleQuizSteps>
  );
}
