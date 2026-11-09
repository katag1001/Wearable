// The style quiz's steps, one screen at a time - the same for a new user's
// quiz (app/style-quiz.jsx) and its retake on Style Preferences
// (account/style.jsx). The logic is useStyleQuiz (shared with the web).
// A retake (quiz.retake) has a Skip on every step, which keeps the saved
// answer. `edges`: the Screen's safe-area edges. `children` go under the
// step (the new user's Log out).

import { StyleSheet, Text, View } from "react-native";

import { layeringQuestion } from "@core/constants/pairingQuestions.js";
import {
  coloursQuestion,
  genderQuestionOptions,
  seasonalityQuestion,
  temperatureQuestion,
  trendsQuestion,
  weeklyQuestion,
} from "@core/constants/styleQuizOptions.js";

import { spacing } from "../../theme/tokens";
import { type } from "../../theme/soft";
import { ChoiceCard, Message, Screen } from "../ui";
import { ColoursStep } from "./ColoursStep";
import { ImagesStep } from "./ImagesStep";
import { PairingStep } from "./PairingStep";
import { PointScale } from "./PointScale";
import { QuizActions } from "./QuizActions";
import { SubtitleWithSkip } from "./SubtitleWithSkip";
import { WeeklyStep } from "./WeeklyStep";

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
  colours: { title: coloursQuestion.title },
  pairing: { title: layeringQuestion.title },
  weekly: { title: weeklyQuestion.title },
};

// A retake's Skip under a centred question; nothing on the first quiz.
const RetakeSkip = ({ quiz, onSkip }) =>
  quiz.retake ? <SubtitleWithSkip onSkip={quiz.saving ? undefined : onSkip} /> : null;

export const StyleQuizSteps = ({ quiz, edges, children }) => {
  const { title, subtitle } = STEP_TITLES[quiz.step];

  return (
    <Screen key={quiz.step} title={title} subtitle={subtitle} edges={edges}>
      {quiz.step === "gender" && (
        <>
          <View style={styles.questionSpace}>
            <Text style={styles.centredQuestion}>How do you prefer to dress?</Text>
            <RetakeSkip quiz={quiz} onSkip={quiz.skipGender} />
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
            <RetakeSkip quiz={quiz} onSkip={quiz.skipTemperature} />
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

      {quiz.step === "colours" && <ColoursStep quiz={quiz} />}

      {quiz.step === "pairing" && <PairingStep quiz={quiz} />}

      {quiz.step === "weekly" && <WeeklyStep quiz={quiz} />}

      {quiz.step === "seasonality" && (
        <>
          <View style={styles.questionSpace}>
            <Text style={styles.centredQuestion}>{seasonalityQuestion.title}</Text>
            <Text style={styles.centredHint}>{seasonalityQuestion.hint}</Text>
            <RetakeSkip quiz={quiz} onSkip={quiz.skipSeasonality} />
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
      {children}
    </Screen>
  );
};

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
    ...type.body,
    textAlign: "center",
  },
  // Matches Screen's title, centred.
  centredQuestion: {
    ...type.screenTitle,
    textAlign: "center",
  },
});
