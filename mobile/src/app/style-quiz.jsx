// The style quiz gate: shown after login until the quiz is done (see
// _layout.jsx). The quiz logic is useStyleQuiz, shared with the web.
// Saving it lifts the gate, and the root layout opens the tabs.

import { StyleSheet, Text, View } from "react-native";

import { layeringQuestion } from "@core/constants/pairingQuestions.js";
import {
  genderQuestionOptions,
  seasonalityQuestion,
  temperatureQuestionOptions,
} from "@core/constants/styleQuizOptions.js";
import { useStyleQuiz } from "@core/hooks/useStyleQuiz.js";

import { useSession } from "../auth/SessionProvider";
import { ImagesStep } from "../components/styleQuiz/ImagesStep";
import { PairingStep } from "../components/styleQuiz/PairingStep";
import { QuizActions } from "../components/styleQuiz/QuizActions";
import { SeasonalityScale } from "../components/styleQuiz/SeasonalityScale";
import { WeeklyStep } from "../components/styleQuiz/WeeklyStep";
import { Button, ChoiceCard, Message, Screen } from "../components/ui";
import { colors, fontSizes, fontWeights, spacing } from "../theme/tokens";

const STEP_TITLES = {
  // The gender question has no page title: it sits with its answers.
  gender: {},
  images: {
    title: "Select all that apply",
    subtitle: "Pick every image that feels like you.",
  },
  pairing: layeringQuestion,
  weekly: {
    title: "What do you wear through the week?",
    subtitle: "Pick a day, then what you usually wear that day.",
  },
  seasonality: { title: seasonalityQuestion.title },
  temperature: { title: "Do you generally feel too cold or too hot?" },
};

export default function StyleQuizScreen() {
  const { logout, completeStyleQuiz } = useSession();
  const quiz = useStyleQuiz({ onComplete: completeStyleQuiz });

  const { title, subtitle } = STEP_TITLES[quiz.step];

  return (
    <Screen
      key={quiz.step}
      title={title}
      subtitle={subtitle}
      edges={["top", "bottom"]}
    >
      {quiz.step === "gender" && (
        <>
          <View style={styles.questionSpace}>
            <Text style={styles.centredQuestion}>How do you prefer to dress?</Text>
          </View>
          <View style={styles.centredAnswers}>
            {genderQuestionOptions.map((option) => (
              <ChoiceCard
                key={option.value}
                label={option.label}
                selected={quiz.gender === option.value}
                onPress={() => quiz.chooseGender(option.value)}
              />
            ))}
          </View>
          <View style={styles.questionSpace} />
          <Button label="Log out" variant="text" onPress={logout} />
        </>
      )}

      {quiz.step === "images" && <ImagesStep quiz={quiz} />}

      {quiz.step === "pairing" && <PairingStep quiz={quiz} />}

      {quiz.step === "weekly" && <WeeklyStep quiz={quiz} />}

      {quiz.step === "seasonality" && (
        <>
          <SeasonalityScale value={quiz.seasonality} onChange={quiz.setSeasonality} />
          <QuizActions onBack={quiz.goBack} onNext={quiz.goToNextStep} />
        </>
      )}

      {quiz.step === "temperature" && (
        <>
          <View style={styles.answers}>
            {temperatureQuestionOptions.map((option) => (
              <ChoiceCard
                key={option.value}
                label={option.label}
                onPress={() => quiz.finish(option.value)}
                disabled={quiz.saving}
              />
            ))}
          </View>
          <QuizActions onBack={quiz.goBack} disabled={quiz.saving} />
        </>
      )}

      <Message text={quiz.error} />
    </Screen>
  );
}

// Pick-one answers sit in the middle of the space under the title, with
// the step's buttons (Log out / Back) at the bottom.
const styles = StyleSheet.create({
  answers: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  // Gender: the answers stay in the middle, with equal space above and
  // below; the question sits in the middle of the space above.
  questionSpace: {
    flex: 1,
    justifyContent: "center",
  },
  centredAnswers: {
    gap: spacing.md,
  },
  // Matches Screen's title, centred.
  centredQuestion: {
    fontFamily: fontWeights.light,
    fontSize: fontSizes.title,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: colors.main,
    textAlign: "center",
  },
});
