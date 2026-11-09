// The app's one button, as a pill with an uppercase tracked label.
// "soft" (the default) is the main action: the selected lavender with an
// ink label - there are no big dark buttons (context/visual-language.md).
// "secondary" a translucent white pill with a light top edge, "text" a
// plain label. Squeezes slightly
// when pressed; shows a spinner while `loading`.

import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

export const Button = ({
  label,
  onPress,
  variant = "soft",
  disabled = false,
  loading = false,
  style,
}) => {
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[styles.base, styles[variant], inactive && styles.dimmed, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.main} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  soft: {
    backgroundColor: colors.selected,
    boxShadow: shadows.raised,
  },
  secondary: {
    backgroundColor: colors.cardBackground,
    boxShadow: shadows.raised,
  },
  text: {
    minHeight: 40,
  },
  dimmed: {
    opacity: 0.5,
  },
  // Each variant sets its own colour below.
  label: {
    ...type.label,
    textAlign: "center",
  },
  secondaryLabel: {
    color: colors.main,
  },
  softLabel: {
    color: colors.main,
  },
  textLabel: {
    color: colors.secondary,
  },
});
