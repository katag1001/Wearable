// The app's one button, as a pill with an uppercase tracked label.
// "primary" is soft plum ink (one per screen, for the main action),
// "secondary" a translucent white pill with a light top edge, "text" a
// plain label. Squeezes slightly when pressed; shows a spinner while
// `loading`.

import { ActivityIndicator, StyleSheet, Text } from "react-native";

import {
  colors,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";
import { PressableScale } from "../soft/PressableScale";

export const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}) => {
  const isPrimary = variant === "primary";
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
        <ActivityIndicator color={isPrimary ? colors.inverse : colors.main} />
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
  primary: {
    backgroundColor: colors.main,
    boxShadow: shadows.soft,
  },
  secondary: {
    backgroundColor: colors.cardBackground,
    boxShadow: `${shadows.soft}, inset 0px 1px 0px ${colors.lightEdge}`,
  },
  text: {
    minHeight: 40,
  },
  dimmed: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fontWeights.semibold,
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  primaryLabel: {
    color: colors.inverse,
  },
  secondaryLabel: {
    color: colors.main,
  },
  textLabel: {
    color: colors.secondary,
  },
});
