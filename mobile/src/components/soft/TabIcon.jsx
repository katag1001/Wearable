// A bottom-tab icon in the soft look. The active tab sits on a small
// lavender bubble-pill (wash fill, faint iridescent edge, a light top
// edge); the tab bar fades between the two, so it eases in.
// `icon`: a Feather name. Pass as tabBarIcon: tabIcon("sun").

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, View } from "react-native";

import { mid, radii, surface, wash } from "../../theme/soft";

export const TabIcon = ({ icon, focused, color }) => (
  <View style={[styles.pill, focused && styles.active]}>
    <Feather name={icon} size={21} color={color} />
  </View>
);

export const tabIcon =
  (icon) =>
  ({ focused, color }) => <TabIcon icon={icon} focused={focused} color={color} />;

const styles = StyleSheet.create({
  // As tall as the tab bar's icon slot (28) so the label keeps its place;
  // wider, so it centres and overhangs it sideways.
  pill: {
    width: 52,
    height: 28,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: wash.lavender,
    boxShadow: `0px 4px 14px rgba(198, 182, 230, 0.35), inset 0px 1px 0px ${surface.lightEdge}, inset 0px -1px 0px ${mid.sky}55`,
  },
});
