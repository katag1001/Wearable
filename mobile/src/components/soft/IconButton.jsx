// A plain icon that does something: no circle or box, dimming while held
// (context/visual-language.md) - header icons, close crosses, arrows and
// the icons in a photo's corner. `size`: "regular" or "small"
// (iconSizes). `tone`: "soft" (header icons) or "quiet" (crosses, arrows,
// corner icons); `color` overrides it (a favourited heart). `iconSet`: an
// @expo/vector-icons set - Feather unless it hasn't got the icon (hearts,
// the broken heart, the shoe, clothes: MaterialCommunityIcons).

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet } from "react-native";

import { iconSizes, ink } from "../../theme/soft";

const TONES = { soft: ink.soft, quiet: ink.muted };

export const IconButton = ({
  icon,
  label,
  onPress,
  size = "regular",
  tone = "soft",
  color,
  iconSet: Icon = Feather,
  disabled = false,
  hitSlop = 12,
  accessibilityState,
  style,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled, ...accessibilityState }}
    hitSlop={hitSlop}
    style={({ pressed }) => [style, disabled && styles.disabled, pressed && styles.pressed]}
  >
    <Icon name={icon} size={iconSizes[size]} color={color ?? TONES[tone]} />
  </Pressable>
);

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.5,
  },
  disabled: {
    opacity: 0.35,
  },
});
