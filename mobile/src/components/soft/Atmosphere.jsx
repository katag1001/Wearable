// The page behind a soft screen: soft colour patches around the edges,
// blending into a wide white middle (the portfolio's bubble background,
// much lighter), with film grain on top. `weather` (atmosphereMood) leans
// the patches cool or warm. Fills its parent and never catches touches.

import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { atmosphereMood, mid, surface } from "../../theme/soft";

const grain = require("../../../assets/textures/grain.png");

// Around the edge, as in the portfolio: [hue, x, y, radius, strength],
// x / y / radius in % of the screen. Mostly lavender, so the page reads
// purplish. Sky sits in the opposite corners (top right, bottom left) so
// blue and purple stay distinct instead of blending; mint, and a little
// blush and peach, keep the rainbow without turning it red.
const PATCHES = [
  ["lavender", 4, 8, 50, 0.38],
  ["sky", 98, 6, 48, 0.32],
  ["blush", 102, 52, 40, 0.12],
  ["lavender", 96, 94, 50, 0.34],
  ["mint", 50, 102, 44, 0.16],
  ["sky", 4, 92, 46, 0.28],
  ["peach", 30, 104, 34, 0.08],
  ["lavender", -2, 50, 40, 0.24],
];

export const Atmosphere = ({ weather }) => {
  const mood = useMemo(() => atmosphereMood(weather), [weather]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          {PATCHES.map(([hue, x, y, r, strength], index) => (
            <RadialGradient
              key={`patch${index}`}
              id={`patch${index}`}
              cx={x}
              cy={y}
              r={r}
              gradientUnits="userSpaceOnUse"
            >
              <Stop
                offset="0"
                stopColor={mid[hue]}
                stopOpacity={Math.min(1, strength * mood[hue])}
              />
              <Stop offset="0.75" stopColor={mid[hue]} stopOpacity="0" />
            </RadialGradient>
          ))}

          {/* A wide, gradual white middle over the patches, so the colour
              only lives at the edges and there's no visible shape. */}
          <RadialGradient id="centre" cx="50" cy="50" r="62" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface.white} stopOpacity="0.95" />
            <Stop offset="0.4" stopColor={surface.white} stopOpacity="0.8" />
            <Stop offset="1" stopColor={surface.white} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width="100" height="100" fill={surface.white} />
        {PATCHES.map((_, index) => (
          <Rect
            key={index}
            x="0"
            y="0"
            width="100"
            height="100"
            fill={`url(#patch${index})`}
          />
        ))}
        <Rect x="0" y="0" width="100" height="100" fill="url(#centre)" />
      </Svg>

      <Image source={grain} resizeMode="repeat" style={styles.grain} />
    </View>
  );
};

const styles = StyleSheet.create({
  grain: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
});
