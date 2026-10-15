// A large tappable answer ("More feminine", "Too cold"...). Outlined, and
// filled black when selected.

import { Pressable, StyleSheet, Text } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";

export const ChoiceCard = ({ label, selected = false, onPress, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ selected, disabled }}
    style={({ pressed }) => [
      styles.card,
      selected && styles.selected,
      (pressed || disabled) && styles.dimmed,
    ]}
  >
    <Text style={[styles.label, selected && styles.selectedLabel]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
  },
  selected: {
    backgroundColor: colors.main,
    borderColor: colors.main,
  },
  dimmed: {
    opacity: 0.6,
  },
  label: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    color: colors.main,
  },
  selectedLabel: {
    color: colors.inverse,
  },
});
