// A quiz step's subtitle (matching Screen's) with a small Skip on the
// line below, at the right. Used by the optional steps, which
// pass no subtitle to Screen. Without `text` it's just the Skip.

import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, fontWeights, spacing } from "../../theme/tokens";

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
  subtitle: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.secondary,
  },
  skip: {
    alignSelf: "flex-end",
    color: colors.muted,
  },
});
