// Back / Next under a quiz step. Leave out onNext for steps that move on
// by themselves when you answer.

import { StyleSheet, View } from "react-native";

import { spacing } from "@core/theme/tokens.js";

import { Button } from "../ui";

export const QuizActions = ({ onBack, onNext, nextDisabled, disabled }) => (
  <View style={styles.actions}>
    <Button
      label="Back"
      variant="secondary"
      onPress={onBack}
      disabled={disabled}
      style={styles.button}
    />
    {onNext ? (
      <Button
        label="Next"
        onPress={onNext}
        disabled={nextDisabled || disabled}
        style={styles.button}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
