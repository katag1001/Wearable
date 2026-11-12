// The selected state for a tile: a plain ring just inside its rounded
// edge, in the selection colour. Fills its parent, which should clip
// (overflow hidden) and pass its corner `radius`.

import { StyleSheet, View } from "react-native";

import { selection } from "../../theme/soft";

const WIDTH = 3;

export const SelectionHalo = ({ radius }) => (
  <View
    style={[styles.ring, { borderRadius: radius }]}
    pointerEvents="none"
  />
);

const styles = StyleSheet.create({
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: WIDTH,
    borderColor: selection.ring,
  },
});
