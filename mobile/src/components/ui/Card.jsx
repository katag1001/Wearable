// A bordered box on white - the base for outfit and item cards.

import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@core/theme/tokens.js";

export const Card = ({ style, children }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
  },
});
