// A 1-5 scale question (seasonality, temperature), used by the style quiz
// and Style preferences. `question` gives the labels under the ends (and
// the middle, if it has one). Any hint is shown with the question by the
// screen using it. Numbered
// segments by default; `smooth` shows a sliding thumb instead
// (temperature, seasonality), on a rail graded through `run` (temperature
// by default - ui/PointSlider).

import { StyleSheet, Text, View } from "react-native";

import { fivePointScale } from "@core/constants/styleQuizOptions.js";

import { space, type } from "../../theme/soft";
import { PointSlider, SegmentedControl } from "../ui";

const OPTIONS = fivePointScale.map((point) => ({ key: String(point), label: String(point) }));

export const PointScale = ({ question, value, onChange, smooth = false, run }) => (
  <View style={styles.scale}>
    {smooth ? (
      <PointSlider
        points={fivePointScale}
        value={value}
        onChange={onChange}
        label={question.title}
        run={run}
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
    gap: space.xs,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.xs,
  },
  label: {
    ...type.caption,
    flex: 1,
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
