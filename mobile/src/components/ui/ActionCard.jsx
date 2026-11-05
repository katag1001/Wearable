// A big tappable choice: an icon on a soft tint, a light title, a line of
// description and an arrow, on a soft white card. The + tab's Add item /
// Build outfit, and Add item's Take photo / Choose photo. `tint` is the
// icon circle's colour (a wash from theme/soft).

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";
import { textSizes } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

export const ActionCard = ({ icon, title, text, tint, onPress }) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityHint={text}
    style={styles.card}
  >
    <View style={[styles.icon, { backgroundColor: tint }]}>
      <Feather name={icon} size={22} color={colors.main} />
    </View>

    <View style={styles.text}>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.description}>{text}</Text> : null}
    </View>

    <Feather name="arrow-right" size={18} color={colors.muted} />
  </PressableScale>
);

// A column of them, spaced.
export const ActionCards = ({ children }) => (
  <View style={styles.cards}>{children}</View>
);

const styles = StyleSheet.create({
  cards: {
    gap: spacing.lg,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderCurve: "continuous",
    backgroundColor: colors.cardBackground,
    boxShadow: `${shadows.soft}, inset 0px 1px 0px ${colors.lightEdge}`,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontWeights.light,
    fontSize: textSizes.h4,
    lineHeight: 28,
    color: colors.main,
  },
  description: {
    fontFamily: fontWeights.regular,
    fontSize: textSizes.md,
    lineHeight: 20,
    color: colors.secondary,
  },
});
