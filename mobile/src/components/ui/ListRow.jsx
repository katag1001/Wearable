// A full-width tappable row with an arrow, for menus like the Profile
// tab. No dividers - rows are spaced; a pressed row nudges right.
// `destructive` shows it in the error colour (Delete account).

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontWeights, spacing, textSizes } from "../../theme/tokens";

export const ListRow = ({ label, onPress, destructive = false, chevron = true }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
  >
    <Text style={[styles.label, destructive && styles.destructive]}>
      {label}
    </Text>
    {chevron ? (
      <Feather name="arrow-right" size={18} color={colors.muted} />
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  pressed: {
    transform: [{ translateX: 6 }],
  },
  label: {
    fontFamily: fontWeights.regular,
    fontSize: textSizes.xl,
    color: colors.main,
  },
  destructive: {
    color: colors.error,
  },
});
