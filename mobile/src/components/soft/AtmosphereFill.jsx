// The Atmosphere's colours as one soft diagonal blend (theme
// atmosphereBlend), for things that are "filled in": a selected chip.
// AtmosphereFill fills its parent (give the parent overflow hidden and its
// corner radius); AtmosphereGradient goes in another Svg's Defs and is
// used as fill="url(#id)".

import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { atmosphereBlend, atmosphereColours } from "../../theme/soft";

export const AtmosphereGradient = ({ id }) => (
  <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    {atmosphereBlend.hues.map((hue, index) => (
      <Stop
        key={index}
        offset={index / (atmosphereBlend.hues.length - 1)}
        stopColor={atmosphereColours[hue]}
        stopOpacity={atmosphereBlend.opacity}
      />
    ))}
  </LinearGradient>
);

export const AtmosphereFill = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <AtmosphereGradient id="atmosphereFill" />
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#atmosphereFill)" />
    </Svg>
  </View>
);
