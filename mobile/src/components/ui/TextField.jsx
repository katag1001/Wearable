// A labelled text input: a small spaced-capitals label over a soft white
// field with no border, glowing lavender while focused. Any TextInput prop
// (secureTextEntry, keyboardType, autoComplete...) passes straight through.

import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "../../theme/tokens";
import { mid, type } from "../../theme/soft";

export const TextField = ({ label, style, onFocus, onBlur, ...inputProps }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, focused && styles.focused]}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...inputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    ...type.eyebrow,
  },
  input: {
    borderRadius: radius.md,
    borderCurve: "continuous",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    color: colors.main,
    backgroundColor: colors.fieldBackground,
    boxShadow: `inset 0px 1px 0px ${colors.lightEdge}`,
  },
  focused: {
    boxShadow: `0px 0px 0px 3px ${mid.lavender}66, 0px 8px 22px ${mid.lavender}40`,
  },
});
