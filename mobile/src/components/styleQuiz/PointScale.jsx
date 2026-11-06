// A 1-5 scale question (seasonality, temperature), used by the style quiz
// and Style preferences. `question` gives the labels under the ends (and
// the middle, if it has one). Any hint is shown with the question by the
// screen using it. Numbered
// segments by default; `smooth` shows a sliding thumb instead
// (temperature, seasonality).

import { StyleSheet, Text, View } from "react-native";

import { fivePointScale } from "@core/constants/styleQuizOptions.js";

import { colors, fontSizes, fontWeights, spacing } from "../../theme/tokens";
import { PointSlider, SegmentedControl } from "../ui";

const OPTIONS = fivePointScale.map((point) => ({ key: String(point), label: String(point) }));

export const PointScale = ({ question, value, onChange, smooth = false }) => (
  <View style={styles.scale}>
    {smooth ? (
      <PointSlider
        points={fivePointScale}
        value={value}
        onChange={onChange}
        label={question.title}
      />
    ) : (
      <SegmentedControl
        options={OPTIONS}
        value={String(value)}
        onChange={(key) => onChange(Number(key))}
      />
    )}
    <View style={styles.labels}>
      <Text style={[styles.label, styles.low]}>{question.lowLabel}</Text>
      {question.midLabel ? (
        <Text style={[styles.label, styles.mid]}>{question.midLabel}</Text>
      ) : null}
      <Text style={[styles.label, styles.high]}>{question.highLabel}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scale: {
    gap: spacing.sm,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  label: {
    flex: 1,
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  low: {
    textAlign: "left",
  },
  mid: {
    textAlign: "center",
  },
  high: {
    textAlign: "right",
  },
});
