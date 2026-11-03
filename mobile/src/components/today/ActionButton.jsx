// The round icon buttons under a swipe deck (heart, broken heart, shoe):
// the icon in soft ink on a plain translucent white circle with a faint
// shadow - no rim or highlight. `active` fills it in blush - e.g. the
// heart for what's already worn today.
// `small`: a lesser action, sat between the big ones. `iconSet`: an
// @expo/vector-icons set (Feather by default).

import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { PressableScale } from "../soft";
import { deep, ink, shadows, space, surface, wash } from "../../theme/soft";

const SIZE = 60;
const SMALL_SIZE = 46;

export const ActionButton = ({
  icon,
  label,
  onPress,
  loading,
  active,
  small = false,
  iconSet: Icon = Feather,
}) => {
  const size = small ? SMALL_SIZE : SIZE;
  const iconColor = active ? deep.blush : ink.soft;

  return (
    <PressableScale
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(active) }}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        active && styles.active,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <Icon name={icon} size={small ? 22 : 27} color={iconColor} />
      )}
    </PressableScale>
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
    gap: space.xl,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: surface.veil,
    boxShadow: shadows.soft,
  },
  active: {
    backgroundColor: wash.blush,
  },
});
