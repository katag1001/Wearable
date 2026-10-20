// The round icon buttons under a swipe deck (heart, bin, shoe). `active`
// fills it in - e.g. the heart for what's already worn today. `small`: a
// lesser action, sat between the big ones. `iconSet`: an @expo/vector-icons
// set (Feather by default).

import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { colors, spacing } from "@core/theme/tokens.js";

export const ActionButton = ({
  icon,
  label,
  onPress,
  loading,
  active,
  small = false,
  iconSet: Icon = Feather,
}) => {
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
        small && styles.small,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <Icon name={icon} size={small ? 22 : 28} color={iconColor} />
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
    alignItems: "center",
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
  small: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  active: {
    backgroundColor: colors.main,
  },
  pressed: {
    opacity: 0.6,
  },
});
