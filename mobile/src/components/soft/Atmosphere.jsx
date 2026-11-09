// The page behind a soft screen: blurred patches of every bubble colour
// (theme iridescent - blush, lavender, sky, mint, peach) scattered over the
// whole screen, no white middle, with film grain on top. The layout is
// picked at random once per app launch, so every page shares it.
// `weather` (atmosphereMood) leans the patches cool or warm. Fills its
// parent and never catches touches.

import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { atmosphereMood, mid, surface } from "../../theme/soft";

const grain = require("../../../assets/textures/grain.png");

const HUES = ["blush", "lavender", "sky", "mint", "peach"];

// The bubble colours, a touch clearer than the theme's for the page: a
// cooler pink than mid.blush so it reads pink rather than peachy where it
// blends, and a brighter blue and green.
const PATCH_COLOURS = {
  ...mid,
  blush: "#EFA6C6",
  sky: "#9CBEF2",
  mint: "#A3DAC6",
};

// A 3 x 4 grid of cells, one patch somewhere in each, so the colour covers
// the screen evenly. The patches are small enough to leave some white
// between them.
const COLUMNS = 3;
const ROWS = 4;

const between = (low, high) => low + Math.random() * (high - low);

const shuffle = (list) => {
  const copy = [...list];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }

  return copy;
};

// [hue, x, y, radius, strength], x / y / radius in % of the screen. Every
// hue comes round twice or more, in a random order, so no colour leads.
const scatterPatches = () => {
  const count = COLUMNS * ROWS;
  const hues = shuffle(
    Array.from({ length: count }, (_, index) => HUES[index % HUES.length])
  );

  return hues.map((hue, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const x = ((column + between(0.1, 0.9)) / COLUMNS) * 100;
    const y = ((row + between(0.1, 0.9)) / ROWS) * 100;

    return [hue, x, y, between(24, 36), between(0.18, 0.28)];
  });
};

const PATCHES = scatterPatches();

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
                stopColor={PATCH_COLOURS[hue]}
                stopOpacity={Math.min(1, strength * mood[hue])}
              />
              <Stop offset="1" stopColor={PATCH_COLOURS[hue]} stopOpacity="0" />
            </RadialGradient>
          ))}
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
