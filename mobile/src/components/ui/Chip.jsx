// A small rounded toggle: seasons, colours, types, filters. A white pill;
// selected, it fills with the selected lilac (colors.selected) and its
// label darkens. Nothing else changes, so it never shifts.
// `swatch` shows a colour dot (with a white ring) before the label.

import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";
import { boxEdge } from "../../theme/soft";

export const Chip = ({ label, selected = false, onPress, swatch }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    style={({ pressed }) => [
      styles.chip,
      selected && styles.selected,
      pressed && styles.pressed,
    ]}
  >
    <View style={styles.content}>
      {swatch ? (
        <View style={[styles.swatch, { backgroundColor: swatch }]} />
      ) : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
    ...boxEdge,
  },
  selected: {
    backgroundColor: colors.selected,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.inverse,
    boxShadow: shadows.soft,
  },
  label: {
    fontFamily: fontWeights.medium,
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  // Same weight as unselected, so the chip keeps its size - only the
  // colour deepens.
  selectedLabel: {
    color: colors.main,
  },
});
