// A small rounded toggle: seasons, colours, types, filters. A translucent
// white pill; selected, it turns soft lavender with a stronger label.
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
    gap: spacing.sm,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.cardBackground,
    boxShadow: `inset 0px 1px 0px ${colors.lightEdge}`,
  },
  selected: {
    backgroundColor: colors.selected,
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
  selectedLabel: {
    fontFamily: fontWeights.semibold,
    color: colors.main,
  },
});
