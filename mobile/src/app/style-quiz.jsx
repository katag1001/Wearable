// The style quiz gate: shown after login until the quiz is done (see
// _layout.jsx). The quiz logic is useStyleQuiz, shared with the web.
// Saving it lifts the gate, and the root layout opens the tabs.

import {
  genderQuestionOptions,
  temperatureQuestionOptions,
} from "@core/constants/styleQuizOptions.js";
import { useStyleQuiz } from "@core/hooks/useStyleQuiz.js";

import { useSession } from "../auth/SessionProvider";
import { ImagesStep } from "../components/styleQuiz/ImagesStep";
import { PairingStep } from "../components/styleQuiz/PairingStep";
import { QuizActions } from "../components/styleQuiz/QuizActions";
import { WeeklyStep } from "../components/styleQuiz/WeeklyStep";
import { Button, ChoiceCard, Message, Screen } from "../components/ui";

const STEP_TITLES = {
  gender: { title: "How do you usually dress?" },
  images: {
    title: "Select all that apply",
    subtitle: "Pick every image that feels like you.",
  },
  weekly: {
    title: "What do you wear through the week?",
    subtitle: "Pick a day, then what you usually wear that day.",
  },
  temperature: { title: "Do you generally feel too cold or too hot?" },
};

export default function StyleQuizScreen() {
  const { logout, completeStyleQuiz } = useSession();
  const quiz = useStyleQuiz({ onComplete: completeStyleQuiz });

  const { title, subtitle } =
    quiz.step === "pairing"
      ? { title: quiz.pairingQuestion.section }
      : STEP_TITLES[quiz.step];

  return (
    <Screen
      key={quiz.step}
      title={title}
      subtitle={subtitle}
      edges={["top", "bottom"]}
    >
      {quiz.step === "gender" && (
        <>
          {genderQuestionOptions.map((option) => (
            <ChoiceCard
              key={option.value}
              label={option.label}
              selected={quiz.gender === option.value}
              onPress={() => quiz.chooseGender(option.value)}
            />
          ))}
          <Button label="Log out" variant="text" onPress={logout} />
        </>
      )}

      {quiz.step === "images" && <ImagesStep quiz={quiz} />}

      {quiz.step === "pairing" && <PairingStep quiz={quiz} />}

      {quiz.step === "weekly" && <WeeklyStep quiz={quiz} />}

      {quiz.step === "temperature" && (
        <>
          {temperatureQuestionOptions.map((option) => (
            <ChoiceCard
              key={option.value}
              label={option.label}
              onPress={() => quiz.finish(option.value)}
              disabled={quiz.saving}
            />
          ))}
          <QuizActions onBack={quiz.goBack} disabled={quiz.saving} />
        </>
      )}

      <Message text={quiz.error} />
    </Screen>
  );
}
