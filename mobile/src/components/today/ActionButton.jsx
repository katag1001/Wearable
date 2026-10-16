// The round icon buttons under a swipe deck (heart, bin). `active` fills
// it in - e.g. the heart for what's already worn today.

import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { colors, spacing } from "@core/theme/tokens.js";

export const ActionButton = ({ icon, label, onPress, loading, active }) => {
  const iconColor = active ? colors.inverse : colors.main;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(active) }}
      style={({ pressed }) => [
        styles.button,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <Feather name={icon} size={28} color={iconColor} />
      )}
    </Pressable>
  );
};

export const ActionRow = ({ children }) => (
  <View style={styles.row}>{children}</View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xxl,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.imageBackground,
  },
  active: {
    backgroundColor: colors.main,
  },
  pressed: {
    opacity: 0.6,
  },
});
