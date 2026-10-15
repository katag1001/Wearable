// "‹  2 of 7  ›" under the outfit and shoe carousels. Next is the one
// that rejects what's being left, so it's labelled.

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

const Arrow = ({ name, label, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={12}
    style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
  >
    <Feather name={name} size={24} color={colors.main} />
  </Pressable>
);

export const Stepper = ({ index, total, onPrev, onNext, noun }) => {
  if (total <= 1) return null;

  return (
    <View style={styles.stepper}>
      <Arrow name="chevron-left" label={`Previous ${noun}`} onPress={onPrev} />
      <Text style={styles.position}>
        {index + 1} of {total}
      </Text>
      <Arrow name="chevron-right" label={`Next ${noun}`} onPress={onNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  arrow: {
    padding: spacing.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  position: {
    fontSize: fontSizes.small,
    color: colors.secondary,
    minWidth: 60,
    textAlign: "center",
  },
});
