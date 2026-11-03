// Two or three options side by side, one selected ("All Time" /
// "This Year"): a soft lavender track with the selected option on a white
// pill. `options` is [{ key, label }].

import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";

export const SegmentedControl = ({ options, value, onChange }) => (
  <View style={styles.control} accessibilityRole="tablist">
    {options.map((option) => {
      const selected = option.key === value;

      return (
        <Pressable
          key={option.key}
          onPress={() => onChange(option.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
          style={[styles.segment, selected && styles.selected]}
        >
          <Text style={[styles.label, selected && styles.selectedLabel]}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  control: {
    flexDirection: "row",
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.imageBackground,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  selected: {
    backgroundColor: colors.inverse,
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
