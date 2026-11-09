// A raised surface - the base for outfit and item cards: translucent
// white over the atmosphere, a faint shadow and a light top edge, no
// border.

import { StyleSheet, View } from "react-native";

import { colors, radius, shadows, spacing } from "../../theme/tokens";

export const Card = ({ style, children }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderCurve: "continuous",
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
    boxShadow: shadows.raised,
  },
});
