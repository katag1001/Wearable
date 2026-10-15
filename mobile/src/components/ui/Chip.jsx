// A small rounded toggle: seasons, colours, types, filters. `swatch`
// shows a colour dot before the label.

import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";

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
    {swatch ? (
      <View style={[styles.swatch, { backgroundColor: swatch }]} />
    ) : null}
    <Text style={[styles.label, selected && styles.selectedLabel]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  selected: {
    backgroundColor: colors.main,
    borderColor: colors.main,
  },
  pressed: {
    opacity: 0.7,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hoverBorder,
  },
  label: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.medium,
    color: colors.main,
  },
  selectedLabel: {
    color: colors.inverse,
  },
});
