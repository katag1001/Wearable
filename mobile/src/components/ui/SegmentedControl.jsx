// Two or more options side by side, one selected (Yes / No, 1-5): a white
// pill track with the selected option filled lilac, as a selected chip is,
// in chip labels that keep their weight. `options` is [{ key, label }].

import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/tokens";
import { radii, space, surface, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

export const SegmentedControl = ({ options, value, onChange }) => (
  <View style={styles.control} accessibilityRole="tablist">
    {options.map((option) => {
      const selected = option.key === value;

      return (
        <PressableScale
          key={option.key}
          onPress={() => onChange(option.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
          style={[styles.segment, selected && styles.selected]}
        >
          <Text style={[styles.label, selected && styles.selectedLabel]}>
            {option.label}
          </Text>
        </PressableScale>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  control: {
    flexDirection: "row",
    borderRadius: radii.pill,
    backgroundColor: surface.white,
  },
  segment: {
    flex: 1,
    paddingVertical: space.xs + 1,
    borderRadius: radii.pill,
    alignItems: "center",
  },
  selected: {
    backgroundColor: colors.selected,
  },
  label: type.chipLabel,
  selectedLabel: {
    color: colors.main,
  },
});
