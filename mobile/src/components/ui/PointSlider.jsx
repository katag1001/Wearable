// A one-thumb slider over a few fixed points (the 1-5 scales).
// The thumb follows the finger smoothly and eases to the nearest point on
// release; tapping the track jumps there. The rail (ui/SliderRail) is
// graded through `run` - temperatureRun (cold to warm) by default, scaleRun
// for scales where cold and warm mean nothing - with a small mark at each
// point, and the thumb is a white bubble like RangeSlider's. Screen
// readers step point by point.

import { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import { colors } from "../../theme/tokens";
import { motion, shadows, temperatureRun } from "../../theme/soft";
import { SliderRail } from "./SliderRail";

const THUMB = 28;
const MARK = 6;

export const PointSlider = ({ points, value, onChange, label, run = temperatureRun }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const thumbX = useRef(new Animated.Value(0)).current;
  const dragging = useRef(false);
  const startX = useRef(0);

  const first = points[0];
  const last = points[points.length - 1];

  // The pan handlers are made once, so they read the latest values here.
  const latest = useRef(null);
  latest.current = { trackWidth, value, onChange };

  const toX = (point) => ((point - first) / (last - first)) * latest.current.trackWidth;
  const clampX = (x) => Math.min(latest.current.trackWidth, Math.max(0, x));
  const nearestPoint = (x) => {
    const width = latest.current.trackWidth;
    return Math.round(first + (width ? x / width : 0) * (last - first));
  };

  const settle = (x) => {
    const point = nearestPoint(x);

    dragging.current = false;
    Animated.timing(thumbX, {
      toValue: toX(point),
      duration: motion.press,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();

    if (point !== latest.current.value) {
      latest.current.onChange(point);
    }
  };

  // Sit on the chosen point whenever it (or the track width) changes.
  useEffect(() => {
    if (!dragging.current) {
      thumbX.setValue(toX(value));
    }
  }, [value, trackWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Don't let a surrounding scroll view take over mid-drag.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        dragging.current = true;
        startX.current = clampX(event.nativeEvent.locationX);
        thumbX.setValue(startX.current);
      },
      onPanResponderMove: (_, gesture) => {
        thumbX.setValue(clampX(startX.current + gesture.dx));
      },
      onPanResponderRelease: (_, gesture) => settle(clampX(startX.current + gesture.dx)),
      onPanResponderTerminate: (_, gesture) => settle(clampX(startX.current + gesture.dx)),
    })
  ).current;

  const step = (by) => {
    const next = Math.min(last, Math.max(first, value + by));
    if (next !== value) onChange(next);
  };

  return (
    <View style={styles.slider}>
      <View
        {...responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: first, max: last, now: value }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) =>
          step(event.nativeEvent.actionName === "increment" ? 1 : -1)
        }
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={styles.track}
      >
        <SliderRail run={run} />

        {trackWidth
          ? points.map((point) => (
              <View
                key={point}
                pointerEvents="none"
                style={[styles.mark, { left: toX(point) - MARK / 2 }]}
              />
            ))
          : null}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { transform: [{ translateX: Animated.subtract(thumbX, THUMB / 2) }] },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slider: {
    paddingHorizontal: THUMB / 2,
  },
  track: {
    height: THUMB + 8,
    justifyContent: "center",
  },
  mark: {
    position: "absolute",
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    backgroundColor: colors.inverse,
    opacity: 0.9,
  },
  thumb: {
    position: "absolute",
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.inverse,
    boxShadow: shadows.thumb,
  },
});
