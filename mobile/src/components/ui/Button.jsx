// The app's one button, as a pill with an uppercase tracked label.
// "soft" (the default) is the main action: the selected lavender with an
// ink label - there are no big dark buttons (context/visual-language.md).
// "secondary" the house white (veil) pill with a light top edge, "text"
// the plain text action (type.textAction, as ui/TextAction) centred on its
// row. Squeezes slightly when pressed; shows the breathing bubble while
// `loading`. `icon`: a Feather icon beside the label (`iconPosition`
// "end" or "start").

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/tokens";
import { iconSizes, loaderSizes, radii, shadows, space, surface, type } from "../../theme/soft";
import { BubbleLoader } from "../soft/BubbleLoader";
import { PressableScale } from "../soft/PressableScale";

export const Button = ({
  label,
  onPress,
  variant = "soft",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "end",
  style,
}) => {
  const inactive = disabled || loading;
  const labelStyle = [styles.label, styles[`${variant}Label`]];
  const iconView = icon ? (
    <Feather name={icon} size={iconSizes.small} color={StyleSheet.flatten(labelStyle).color} />
  ) : null;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[styles.base, styles[variant], inactive && styles.dimmed, style]}
    >
      {loading ? (
        <BubbleLoader size={loaderSizes.small} fill={false} />
      ) : (
        <View style={styles.content}>
          {iconPosition === "start" ? iconView : null}
          <Text style={labelStyle}>{label}</Text>
          {iconPosition === "end" ? iconView : null}
        </View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.pill,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  soft: {
    backgroundColor: colors.selected,
    boxShadow: shadows.raised,
  },
  secondary: {
    backgroundColor: surface.veil,
    boxShadow: shadows.raised,
  },
  text: {
    minHeight: 40,
  },
  dimmed: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  // Each variant sets its own colour below.
  label: {
    ...type.label,
    textAlign: "center",
  },
  secondaryLabel: {
    color: colors.main,
  },
  softLabel: {
    color: colors.main,
  },
  textLabel: type.textAction,
});
