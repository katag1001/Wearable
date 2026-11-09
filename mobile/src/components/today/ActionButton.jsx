// The round icon buttons under a swipe deck (heart, broken heart, shoe):
// the icon in soft ink on a plain translucent white circle with a faint
// shadow - no rim or highlight. `active` fills it blush with a white icon
// (hearts in theme/soft) - e.g. the
// heart for what's already worn today.
// `small`: a lesser action, sat between the big ones. `iconSet`: an
// @expo/vector-icons set (Feather by default).

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, View } from "react-native";

import { BubbleLoader, PressableScale } from "../soft";
import { hearts, ink, loaderSizes, shadows, space, surface } from "../../theme/soft";

const SIZE = 60;
const SMALL_SIZE = 46;

export const ActionButton = ({
  icon,
  label,
  onPress,
  loading,
  active,
  disabled = false,
  small = false,
  iconSet: Icon = Feather,
}) => {
  const size = small ? SMALL_SIZE : SIZE;
  const iconColor = active ? hearts.wornIcon : ink.soft;

  return (
    <PressableScale
      onPress={onPress}
      disabled={loading || disabled}
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
        <BubbleLoader size={loaderSizes.small} fill={false} />
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
    gap: space.xxl,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: surface.veil,
    boxShadow: shadows.soft,
  },
  active: {
    backgroundColor: hearts.worn,
  },
});
