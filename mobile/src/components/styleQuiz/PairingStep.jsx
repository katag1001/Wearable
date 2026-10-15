// Style quiz: one Yes / Sometimes / No pairing question at a time.
// Answering moves on by itself (useStyleQuiz.answerPairing).

import { StyleSheet, Text } from "react-native";

import { pairingAnswerOptions } from "@core/constants/pairingQuestions.js";
import { colors, fontSizes } from "@core/theme/tokens.js";

import { ChoiceCard, Grid, ImageTile } from "../ui";
import { QuizActions } from "./QuizActions";

export const PairingStep = ({ quiz }) => {
  const { question, images } = quiz.pairingQuestion;

  return (
    <>
      <Text style={styles.question}>{question}</Text>

      <Grid columns={3}>
        {images.map((image, index) => (
          <ImageTile
            key={index}
            source={image}
            placeholder="Image coming soon"
            aspectRatio={3 / 4}
          />
        ))}
      </Grid>

      {pairingAnswerOptions.map((option) => (
        <ChoiceCard
          key={option.value}
          label={option.label}
          selected={quiz.pairingAnswer === option.value}
          onPress={() => quiz.answerPairing(option.value)}
        />
      ))}

      <QuizActions onBack={quiz.backFromPairing} />
    </>
  );
};

const styles = StyleSheet.create({
  question: {
    fontSize: fontSizes.body,
    color: colors.main,
  },
});
