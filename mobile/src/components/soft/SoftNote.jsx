// An inline notice on a soft tint, no border: "error" (rose-clay on blush)
// or "success" (sage on mint). Renders nothing without text. The soft
// ui/Message.

import { StyleSheet, Text } from "react-native";

import { continuous, radii, semantic, space, type } from "../../theme/soft";

export const SoftNote = ({ text, type: kind = "error" }) => {
  if (!text) return null;

  return (
    <Text style={[styles.note, styles[kind]]} accessibilityLiveRegion="polite">
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  note: {
    ...type.small,
    ...continuous,
    borderRadius: radii.tile,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    overflow: "hidden",
  },
  error: {
    backgroundColor: semantic.errorWash,
    color: semantic.error,
  },
  success: {
    backgroundColor: semantic.successWash,
    color: semantic.success,
  },
});
