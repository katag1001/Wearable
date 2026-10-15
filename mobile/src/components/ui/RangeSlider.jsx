// A min / max slider with two thumbs (temperature ranges), like the web's
// temperatureSlider.jsx. The thumbs can't cross. Screen readers can
// adjust each thumb by one step.

import { useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  radius,
  spacing,
} from "@core/theme/tokens.js";

const THUMB = 28;

export const RangeSlider = ({
  min,
  max,
  valueMin,
  valueMax,
  step = 1,
  onChange,
  unit = "°",
}) => {
  const [trackWidth, setTrackWidth] = useState(0);

  // The pan handlers are made once, so they read the latest values here.
  const latest = useRef(null);
  latest.current = { trackWidth, valueMin, valueMax, onChange };

  const startX = useRef(0);

  const toX = (value) =>
    ((value - min) / (max - min)) * latest.current.trackWidth;

  const toValue = (x) => {
    const width = latest.current.trackWidth;
    const ratio = width ? Math.min(1, Math.max(0, x / width)) : 0;

    return Math.round((min + ratio * (max - min)) / step) * step;
  };

  const setThumb = (thumb, value) => {
    const { valueMin: low, valueMax: high, onChange: change } = latest.current;

    if (thumb === "min") {
      change(Math.min(value, high), high);
    } else {
      change(low, Math.max(value, low));
    }
  };

  const makeResponder = (thumb) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Don't let a surrounding scroll view take over mid-drag.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const { valueMin: low, valueMax: high } = latest.current;
        startX.current = toX(thumb === "min" ? low : high);
      },
      onPanResponderMove: (_, gesture) => {
        setThumb(thumb, toValue(startX.current + gesture.dx));
      },
    });

  const responders = useRef(null);

  if (!responders.current) {
    responders.current = { min: makeResponder("min"), max: makeResponder("max") };
  }

  const accessibilityProps = (thumb, value, label) => ({
    accessible: true,
    accessibilityRole: "adjustable",
    accessibilityLabel: label,
    accessibilityValue: { text: `${value}${unit}` },
    accessibilityActions: [{ name: "increment" }, { name: "decrement" }],
    onAccessibilityAction: (event) =>
      setThumb(
        thumb,
        value + (event.nativeEvent.actionName === "increment" ? step : -step)
      ),
  });

  const left = toX(valueMin);
  const right = toX(valueMax);

  return (
    <View style={styles.slider}>
      <View
        style={styles.track}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.rail} />
        <View style={[styles.range, { left, width: right - left }]} />

        <View
          {...responders.current.min.panHandlers}
          {...accessibilityProps("min", valueMin, "Minimum")}
          style={[styles.thumb, { left: left - THUMB / 2 }]}
        />
        <View
          {...responders.current.max.panHandlers}
          {...accessibilityProps("max", valueMax, "Maximum")}
          style={[styles.thumb, { left: right - THUMB / 2 }]}
        />
      </View>

      <View style={styles.values}>
        <Text style={styles.value}>
          {valueMin}
          {unit}
        </Text>
        <Text style={styles.value}>
          {valueMax}
          {unit}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slider: {
    paddingHorizontal: THUMB / 2,
    gap: spacing.sm,
  },
  track: {
    height: THUMB,
    justifyContent: "center",
  },
  rail: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  range: {
    position: "absolute",
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.main,
  },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.inverse,
    borderWidth: 2,
    borderColor: colors.main,
  },
  values: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  value: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
});
