// "‹  2 of 7  ›" under the outfit and shoe carousels. Next is the one
// that rejects what's being left, so it's labelled.

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, shadows, spacing } from "../../theme/tokens";
import { radii, type } from "../../theme/soft";

const Arrow = ({ name, label, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={12}
    style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
  >
    <Feather name={name} size={22} color={colors.secondary} />
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
    borderRadius: radii.pill,
    backgroundColor: colors.cardBackground,
    boxShadow: shadows.soft,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  position: {
    ...type.eyebrow,
    minWidth: 60,
    textAlign: "center",
  },
});
