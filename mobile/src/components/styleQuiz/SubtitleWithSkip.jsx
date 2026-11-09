// A quiz step's subtitle (matching Screen's) with a small Skip on the
// line below, at the right. Used by the optional steps, which
// pass no subtitle to Screen. Without `text` it's just the Skip.

import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme/tokens";
import { type } from "../../theme/soft";

export const SubtitleWithSkip = ({ text, onSkip }) => (
  <View style={styles.row}>
    {text ? <Text style={styles.subtitle}>{text}</Text> : null}
    <Text
      onPress={onSkip}
      accessibilityRole="button"
      suppressHighlighting
      style={[styles.subtitle, styles.skip]}
    >
      Skip
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  subtitle: type.body,
  skip: {
    alignSelf: "flex-end",
    color: colors.muted,
  },
});
