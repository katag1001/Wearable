// An inline notice above a form: "error" or "success" in the web app's
// colours. Renders nothing without text.

import { StyleSheet, Text } from "react-native";

import { colors, fontSizes, radius, spacing } from "@core/theme/tokens.js";

export const Message = ({ text, type = "error" }) => {
  if (!text) return null;

  return (
    <Text
      style={[styles.message, styles[type]]}
      accessibilityLiveRegion="polite"
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  message: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: fontSizes.small,
    overflow: "hidden",
  },
  error: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    color: colors.error,
  },
  success: {
    backgroundColor: colors.successBackground,
    borderColor: colors.successBorder,
    color: colors.success,
  },
});
