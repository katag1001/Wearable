// A menu item as the house box (context/visual-language.md, like Today's
// note banner): translucent white, a light top rim, no border. A small dot
// in `tint`, then a light name over a small-caps line (`text`), and
// a muted arrow. Squeezes when pressed.

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";

import { continuous, ink, radii, shadows, space, surface, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

const DOT = 7;

export const ListRow = ({ label, text, tint, onPress }) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityHint={text}
    style={styles.box}
  >
    {tint ? <View style={[styles.dot, { backgroundColor: tint }]} /> : null}

    <View style={styles.words}>
      <Text style={styles.label}>{label}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>

    <Feather name="arrow-right" size={18} color={ink.muted} />
  </PressableScale>
);

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radii.tile,
    ...continuous,
    backgroundColor: surface.veil,
    boxShadow: shadows.raised,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  words: {
    flex: 1,
    gap: space.xxs,
  },
  label: type.menuLabel,
  text: type.menuText,
});
