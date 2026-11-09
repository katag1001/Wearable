// A small secondary action drawn as plain text, like Today's tappable tag
// line (type.textAction): Skip, Change, Show all, Log out... No box or
// underline; squeezes when pressed. `tone="error"` for a destructive one
// (Delete account), in rose-clay. Button's "text" variant is the same
// words, centred on a full-width row.

import { StyleSheet, Text } from "react-native";

import { semantic, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

export const TextAction = ({
  label,
  onPress,
  tone = "soft",
  disabled = false,
  accessibilityLabel,
  accessibilityState,
  style,
}) => (
  <PressableScale
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ disabled, ...accessibilityState }}
    hitSlop={12}
    style={[disabled && styles.dimmed, style]}
  >
    <Text style={[styles.label, tone === "error" && styles.error]}>{label}</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  label: type.textAction,
  error: {
    color: semantic.error,
  },
  dimmed: {
    opacity: 0.5,
  },
});
