// A slider's rail: a thin rounded bar graded through `run` (temperatureRun
// for every temperature slider, scaleRun for the other 1-5 scales) - the
// same rail under ui/PointSlider and ui/RangeSlider. `width`: a fixed
// width (RangeSlider's chosen stretch draws the full rail inside a
// clipped window); otherwise it fills its parent.

import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { radii } from "../../theme/soft";

export const RAIL_HEIGHT = 6;

export const SliderRail = ({ run, width, style }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <View style={[styles.rail, width != null && { width }, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={`rail${id}`} x1="0" y1="0" x2="1" y2="0">
            {run.map((colour, index) => (
              <Stop
                key={`${colour}-${index}`}
                offset={index / (run.length - 1)}
                stopColor={colour}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={RAIL_HEIGHT / 2} fill={`url(#rail${id})`} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  rail: {
    height: RAIL_HEIGHT,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
});
