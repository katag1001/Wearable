// A labelled text input: a small spaced-capitals label over a field in the
// house white with no border, glowing lavender while focused. Any TextInput prop
// (secureTextEntry, keyboardType, autoComplete...) passes straight through.

import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../../theme/tokens";
import { boxEdge, radii, shadows, space, surface, type } from "../../theme/soft";

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
    gap: space.xs,
  },
  label: {
    ...type.eyebrow,
  },
  input: {
    borderRadius: radii.input,
    borderCurve: "continuous",
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    ...type.input,
    backgroundColor: surface.veil,
    ...boxEdge,
  },
  focused: {
    boxShadow: shadows.focus,
  },
});
