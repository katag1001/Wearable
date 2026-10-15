// What a screen or list shows when there's nothing in it yet.

import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@core/theme/tokens.js";

export const EmptyState = ({ title, text, children }) => (
  <View style={styles.empty}>
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
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.semibold,
    color: colors.main,
    textAlign: "center",
  },
  text: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
  },
});
