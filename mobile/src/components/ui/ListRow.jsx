// A full-width tappable row with a chevron, for menus like the Profile
// tab. `destructive` shows it in the error colour (Delete account).

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@core/theme/tokens.js";

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
      <Feather name="chevron-right" size={18} color={colors.muted} />
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    color: colors.main,
  },
  destructive: {
    color: colors.error,
  },
});
