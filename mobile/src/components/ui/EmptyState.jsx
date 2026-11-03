// What a screen or list shows when there's nothing in it yet: a faint
// bubble, a light title and a line of text.

import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, fontWeights, spacing } from "../../theme/tokens";
import { Bubble } from "../soft/Bubble";

export const EmptyState = ({ title, text, children }) => (
  <View style={styles.empty}>
    <Bubble size={64} opacity={0.9} />
    <Text style={styles.title}>{title}</Text>
    {text ? <Text style={styles.text}>{text}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    fontFamily: fontWeights.light,
    fontSize: 22,
    lineHeight: 28,
    color: colors.main,
    textAlign: "center",
  },
  text: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.secondary,
    textAlign: "center",
  },
});
