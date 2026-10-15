// Two or three options side by side, one selected ("All Time" /
// "This Year"). `options` is [{ key, label }].

import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";

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
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.imageBackground,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  selected: {
    backgroundColor: colors.main,
  },
  label: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.medium,
    color: colors.secondary,
  },
  selectedLabel: {
    color: colors.inverse,
  },
});
