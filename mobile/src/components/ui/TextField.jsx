// A labelled text input. Any TextInput prop (secureTextEntry,
// keyboardType, autoComplete...) passes straight through.

import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";

export const TextField = ({ label, style, ...inputProps }) => (
  <View style={[styles.field, style]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.muted}
      accessibilityLabel={label}
      {...inputProps}
    />
  </View>
);

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.medium,
    color: colors.secondary,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSizes.body,
    color: colors.main,
  },
});
