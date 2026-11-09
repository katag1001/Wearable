// A bottom-tab icon in the soft look. The active tab sits on a small
// lavender bubble-pill (wash fill, faint iridescent edge, a light top
// edge); the tab bar fades between the two, so it eases in.
// `icon`: a Feather name. Pass as tabBarIcon: tabIcon("sun").

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, View } from "react-native";

import { accent, radii, shadows } from "../../theme/soft";

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
    backgroundColor: accent.wash,
    boxShadow: shadows.tabBubble,
  },
});
