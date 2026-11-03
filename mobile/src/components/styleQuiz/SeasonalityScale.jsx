// "How much does the season affect what you wear?" - a 1-5 scale, used by
// the style quiz and Style preferences.

import { StyleSheet, Text, View } from "react-native";

import {
  seasonalityQuestion,
  seasonalityScale,
} from "@core/constants/styleQuizOptions.js";
import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import { SegmentedControl } from "../ui";

const OPTIONS = seasonalityScale.map((point) => ({ key: String(point), label: String(point) }));

export const SeasonalityScale = ({ value, onChange }) => (
  <View style={styles.scale}>
    <Text style={styles.hint}>{seasonalityQuestion.hint}</Text>
    <SegmentedControl
      options={OPTIONS}
      value={String(value)}
      onChange={(key) => onChange(Number(key))}
    />
    <View style={styles.labels}>
      <Text style={styles.label}>{seasonalityQuestion.lowLabel}</Text>
      <Text style={styles.label}>{seasonalityQuestion.highLabel}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scale: {
    gap: spacing.sm,
  },
  hint: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
});
