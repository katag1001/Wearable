// The app's one button. "primary" is filled black (one per screen, for
// the main action), "secondary" is outlined, "text" is a plain link-style
// button. Shows a spinner while `loading`.

import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  letterSpacing,
  radius,
  spacing,
} from "@core/theme/tokens.js";

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
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (pressed || inactive) && styles.dimmed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.inverse : colors.main} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.main,
  },
  secondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.main,
  },
  text: {
    minHeight: 40,
  },
  dimmed: {
    opacity: 0.5,
  },
  label: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.tight,
  },
  primaryLabel: {
    color: colors.inverse,
  },
  secondaryLabel: {
    color: colors.main,
  },
  textLabel: {
    color: colors.secondary,
    fontWeight: fontWeights.medium,
  },
});
