// A bottom-tab icon in the soft look. The active tab sits on a small
// lavender bubble-pill (wash fill, faint iridescent edge, a light top
// edge); the tab bar fades between the two, so it eases in.
// `icon`: a Feather name, or a MaterialCommunityIcons one with iconSet "mci"
// (Feather has no clothing). Pass as tabBarIcon: tabIcon("sun") or
// tabIcon("hanger", "mci").

import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View } from "react-native";

import { accent, radii, shadows } from "../../theme/soft";

const SETS = { feather: Feather, mci: MaterialCommunityIcons };

export const TabIcon = ({ icon, iconSet = "feather", focused, color }) => {
  const Icon = SETS[iconSet];
  return (
    <View style={[styles.pill, focused && styles.active]}>
      <Icon name={icon} size={21} color={color} />
    </View>
  );
};

export const tabIcon =
  (icon, iconSet) =>
  ({ focused, color }) => (
    <TabIcon icon={icon} iconSet={iconSet} focused={focused} color={color} />
  );

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
