// Lays its children out in equal-width columns with even gaps
// (style images, tag pickers, item tiles).

import { Children } from "react";
import { StyleSheet, View } from "react-native";

import { space } from "../../theme/soft";

export const Grid = ({ columns = 2, gap = space.sm, children }) => (
  <View style={[styles.grid, { marginHorizontal: -gap / 2 }]}>
    {Children.map(children, (child) =>
      child ? (
        <View
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: gap / 2,
            marginBottom: gap,
          }}
        >
          {child}
        </View>
      ) : null
    )}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
