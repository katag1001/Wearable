// A small grey underlined "Skip" for optional quiz steps.

import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSizes, fontWeights, spacing } from "../../theme/tokens";

export const SkipLink = ({ onPress, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    hitSlop={spacing.sm}
    style={styles.skip}
  >
    <Text style={styles.label}>Skip</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  skip: {
    alignSelf: "center",
  },
  label: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.small,
    color: colors.muted,
    textDecorationLine: "underline",
  },
});
