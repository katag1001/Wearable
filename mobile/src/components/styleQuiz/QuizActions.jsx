// Back / Next at the bottom of a quiz step (pushed down when the step is
// shorter than the screen). Leave out onNext for steps that move on by
// themselves when you answer; `nextLabel` renames Next (e.g. "Finish").
// Leave out onBack on the first step: Next sits alone in the middle. Back
// is a step back within the quiz, so it's the plain text action (as Back
// is wherever it steps back inside a page); the arrow is for leaving.

import { StyleSheet, View } from "react-native";

import { space } from "../../theme/soft";
import { Button } from "../ui";

export const QuizActions = ({
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled,
  disabled,
  loading,
}) => (
  <View style={[styles.actions, !onBack && styles.centred]}>
    {onBack ? (
      <Button
        label="Back"
        variant="text"
        onPress={onBack}
        disabled={disabled}
        style={styles.button}
      />
    ) : null}
    {onNext ? (
      <Button
        label={nextLabel}
        onPress={onNext}
        loading={loading}
        disabled={nextDisabled || disabled}
        style={onBack ? styles.button : styles.loneButton}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: "auto",
    paddingTop: space.xs,
  },
  centred: {
    justifyContent: "center",
  },
  button: {
    flex: 1,
  },
  loneButton: {
    width: "50%",
  },
});
