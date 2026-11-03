// The + tab: a choice between adding an item (item/add.jsx, from a photo)
// and building an outfit (build-outfit.jsx). Both screens open on top, the
// same ones Wardrobe's + and Outfits' "Build an outfit" open.

import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontWeights, radius, shadows, spacing } from "../../theme/tokens";
import { wash } from "../../theme/soft";
import { PressableScale } from "../../components/soft";
import { Screen } from "../../components/ui";

const CHOICES = [
  {
    key: "item",
    icon: "camera",
    title: "Add item",
    text: "Photograph a piece of clothing or footwear",
    tint: wash.lavender,
    open: () => router.push("/item/add"),
  },
  {
    key: "outfit",
    icon: "layers",
    title: "Build outfit",
    text: "Put an outfit together from your wardrobe",
    tint: wash.blush,
    open: () => router.push("/build-outfit"),
  },
];

const Choice = ({ choice }) => (
  <PressableScale
    onPress={choice.open}
    accessibilityRole="button"
    accessibilityLabel={choice.title}
    accessibilityHint={choice.text}
    style={styles.choice}
  >
    <View style={[styles.icon, { backgroundColor: choice.tint }]}>
      <Feather name={choice.icon} size={22} color={colors.main} />
    </View>

    <View style={styles.text}>
      <Text style={styles.title}>{choice.title}</Text>
      <Text style={styles.description}>{choice.text}</Text>
    </View>

    <Feather name="arrow-right" size={18} color={colors.muted} />
  </PressableScale>
);

export default function CreateScreen() {
  return (
    <Screen title="Add" centered>
      <View style={styles.choices}>
        {CHOICES.map((choice) => (
          <Choice key={choice.key} choice={choice} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  choices: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  choice: {
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
    fontSize: 22,
    lineHeight: 28,
    color: colors.main,
  },
  description: {
    fontFamily: fontWeights.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
  },
});
