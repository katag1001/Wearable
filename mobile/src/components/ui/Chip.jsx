// A small rounded toggle: seasons, colours, types, filters. A flat white
// pill; selected, a flat lilac one (colors.selected), and its label
// (light spaced capitals, as Today's season line) darkens. Nothing else
// changes, so it never shifts; it squeezes when pressed, like every
// tappable. `swatch` shows a colour dot (with a soft shadow) before the
// label; `icon` a small Feather icon after it (an "x" on a filter that
// can be cleared).

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/tokens";
import { iconSizes, radii, shadows, space, surface, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

export const Chip = ({ label, selected = false, onPress, swatch, icon }) => (
  <PressableScale
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
      {icon ? (
        <Feather
          name={icon}
          size={iconSizes.tiny}
          color={selected ? colors.main : colors.secondary}
        />
      ) : null}
    </View>
  </PressableScale>
);

const styles = StyleSheet.create({
  // Flat: no rim or shadow, so the only change when selected is the fill.
  chip: {
    borderRadius: radii.pill,
    backgroundColor: surface.white,
  },
  selected: {
    backgroundColor: colors.selected,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: radii.pill,
    boxShadow: shadows.soft,
  },
  label: type.chipLabel,
  // Same weight as unselected, so the chip keeps its size - only the
  // colour deepens.
  selectedLabel: {
    color: colors.main,
  },
});
