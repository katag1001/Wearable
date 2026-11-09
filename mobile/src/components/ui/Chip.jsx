// A small rounded toggle: seasons, colours, types, filters. A flat white
// pill; selected, a flat lilac one (colors.selectedSolid), and its label
// (light spaced capitals, as Today's season line) darkens. Nothing else
// changes and nothing moves, so it never shifts.
// `swatch` shows a colour dot (with a white ring) before the label.

import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { type } from "../../theme/soft";

export const Chip = ({ label, selected = false, onPress, swatch }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    style={[styles.chip, selected && styles.selected]}
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
  // Flat: no rim or shadow, so the only change when selected is the fill.
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
  },
  selected: {
    backgroundColor: colors.selectedSolid,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.inverse,
    boxShadow: shadows.soft,
  },
  label: type.chipLabel,
  // Same weight as unselected, so the chip keeps its size - only the
  // colour deepens.
  selectedLabel: {
    color: colors.main,
  },
});
