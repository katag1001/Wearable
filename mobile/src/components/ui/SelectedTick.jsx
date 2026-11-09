// The tick on anything picked from a grid - style images, colour families,
// clothes, outfit cards in select mode: a small white bubble in the top
// left corner with a check, over the iridescent halo (soft/SelectionHalo).
// `checked={false}` is the empty bubble with a faint ring, for a card that
// can be picked. Place it inside the tile; it positions itself.

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, View } from "react-native";

import { iconSizes, ink, radii, shadows, space, surface } from "../../theme/soft";

const SIZE = 24;

export const SelectedTick = ({ checked = true }) => (
  <View style={[styles.tick, !checked && styles.empty]} pointerEvents="none">
    {checked ? <Feather name="check" size={iconSizes.tiny} color={ink.main} /> : null}
  </View>
);

const styles = StyleSheet.create({
  tick: {
    position: "absolute",
    top: space.xs,
    left: space.xs,
    width: SIZE,
    height: SIZE,
    borderRadius: radii.pill,
    backgroundColor: surface.white,
    boxShadow: shadows.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    boxShadow: shadows.tick,
  },
});
