// A big tappable choice, as the house box (like Profile's menu boxes): an
// icon on a soft tint, a light name over a small-caps line, and a muted
// arrow. The + tab's Add item / Build outfit, and Add item's Take photo /
// Choose photo. `tint` is the icon circle's colour (choiceTints in
// theme/soft).

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";

import { houseBox, iconSizes, ink, radii, space, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

const ICON_CIRCLE = 40;

export const ActionCard = ({ icon, title, text, tint, onPress }) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityHint={text}
    style={styles.card}
  >
    <View style={[styles.icon, { backgroundColor: tint }]}>
      <Feather name={icon} size={iconSizes.small} color={ink.main} />
    </View>

    <View style={styles.text}>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.description}>{text}</Text> : null}
    </View>

    <Feather name="arrow-right" size={iconSizes.small} color={ink.muted} />
  </PressableScale>
);

// A column of them, spaced.
export const ActionCards = ({ children }) => (
  <View style={styles.cards}>{children}</View>
);

const styles = StyleSheet.create({
  cards: {
    gap: space.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    padding: space.md,
    ...houseBox,
  },
  icon: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: space.xxs,
  },
  title: type.menuLabel,
  description: type.menuText,
});
