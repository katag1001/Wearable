// The selected state for a tile: an iridescent ring just inside its
// rounded edge (blush → lavender → sky → mint → peach). Fills its parent,
// which should clip (overflow hidden) and pass its corner `radius`.

import { useId, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { iridescent } from "../../theme/soft";

const WIDTH = 3;

export const SelectionHalo = ({ radius }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [size, setSize] = useState(null);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(event) => setSize(event.nativeEvent.layout)}
    >
      {size ? (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id={`halo${id}`} x1="0" y1="0" x2="1" y2="1">
              {iridescent.map((colour, index) => (
                <Stop
                  key={colour}
                  offset={index / (iridescent.length - 1)}
                  stopColor={colour}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect
            x={WIDTH / 2}
            y={WIDTH / 2}
            width={size.width - WIDTH}
            height={size.height - WIDTH}
            rx={Math.max(0, radius - WIDTH / 2)}
            fill="none"
            stroke={`url(#halo${id})`}
            strokeWidth={WIDTH}
          />
        </Svg>
      ) : null}
    </View>
  );
};
