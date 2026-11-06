// The style quiz gate: shown after login until the quiz is done (see
// _layout.jsx). The quiz logic is useStyleQuiz, shared with the web.
// Saving it lifts the gate, and the root layout opens the tabs.

import { StyleSheet, Text, View } from "react-native";

import { layeringQuestion } from "@core/constants/pairingQuestions.js";
import {
  genderQuestionOptions,
  seasonalityQuestion,
  temperatureQuestion,
  trendsQuestion,
} from "@core/constants/styleQuizOptions.js";
import { useStyleQuiz } from "@core/hooks/useStyleQuiz.js";

import { useSession } from "../auth/SessionProvider";
import { ImagesStep } from "../components/styleQuiz/ImagesStep";
import { PairingStep } from "../components/styleQuiz/PairingStep";
import { PointScale } from "../components/styleQuiz/PointScale";
import { QuizActions } from "../components/styleQuiz/QuizActions";
import { SubtitleWithSkip } from "../components/styleQuiz/SubtitleWithSkip";
import { WeeklyStep } from "../components/styleQuiz/WeeklyStep";
import { Button, ChoiceCard, Message, Screen } from "../components/ui";
import { colors, fontSizes, fontWeights, spacing } from "../theme/tokens";

const STEP_TITLES = {
  // Gender, temperature, seasonality and trends have no page title: the
  // question sits with its answers in the middle of the screen.
  gender: {},
  temperature: {},
  seasonality: {},
  trends: {},
  images: {
    title: "Select all that apply",
    subtitle: "Pick every image that feels like you.",
  },
  // The optional steps show their subtitle themselves, on one line with
  // Skip (SubtitleWithSkip).
  pairing: { title: layeringQuestion.title },
  weekly: { title: "Do you have a regular schedule to dress for?" },
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
          <QuizActions
            onNext={quiz.goToNextStep}
            nextDisabled={!quiz.gender}
          />
        </>
      )}

      {quiz.step === "temperature" && (
        <>
          <View style={styles.questionSpace}>
            <Text style={styles.centredQuestion}>{temperatureQuestion.title}</Text>
          </View>
          <PointScale
            question={temperatureQuestion}
            smooth
            value={quiz.temperature}
            onChange={quiz.setTemperature}
          />
          <View style={styles.questionSpace} />
          <QuizActions onBack={quiz.goBack} onNext={quiz.goToNextStep} />
        </>
      )}

      {quiz.step === "images" && <ImagesStep quiz={quiz} />}

      {quiz.step === "pairing" && <PairingStep quiz={quiz} />}

      {quiz.step === "weekly" && <WeeklyStep quiz={quiz} />}

      {quiz.step === "seasonality" && (
        <>
          <View style={styles.questionSpace}>
            <Text style={styles.centredQuestion}>{seasonalityQuestion.title}</Text>
            <Text style={styles.centredHint}>{seasonalityQuestion.hint}</Text>
          </View>
          <PointScale
            question={seasonalityQuestion}
            smooth
            value={quiz.seasonality}
            onChange={quiz.setSeasonality}
          />
          <View style={styles.questionSpace} />
          <QuizActions onBack={quiz.goBack} onNext={quiz.goToNextStep} />
        </>
      )}

      {quiz.step === "trends" && (
        <>
          <View style={styles.questionSpace}>
            <Text style={styles.centredQuestion}>{trendsQuestion.title}</Text>
            <SubtitleWithSkip onSkip={quiz.saving ? undefined : quiz.skipTrends} />
          </View>
          <PointScale
            question={trendsQuestion}
            smooth
            value={quiz.trends}
            onChange={quiz.setTrends}
          />
          <View style={styles.questionSpace} />
          <QuizActions
            onBack={quiz.goBack}
            onNext={quiz.finish}
            nextLabel="Finish"
            disabled={quiz.saving}
            loading={quiz.saving}
          />
        </>
      )}

      <Message text={quiz.error} />
      <Button label="Log out" variant="text" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Gender, temperature, seasonality and trends: the answers stay in the middle,
  // with equal space above and below; the question sits in the middle of the space
  // above.
  questionSpace: {
    flex: 1,
    justifyContent: "center",
  },
  centredAnswers: {
    gap: spacing.md,
  },
  // Under a centred question, like Screen's subtitle.
  centredHint: {
    marginTop: spacing.sm,
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.secondary,
    textAlign: "center",
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
