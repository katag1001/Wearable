// A large tappable answer ("More feminine", "Too cold"...). A translucent
// white card; selected, it turns soft lavender with a gentle glow.

import { StyleSheet, Text } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";
import { mid } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

export const ChoiceCard = ({ label, selected = false, onPress, disabled }) => (
  <PressableScale
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ selected, disabled }}
    style={[styles.card, selected && styles.selected, disabled && styles.dimmed]}
  >
    <Text style={[styles.label, selected && styles.selectedLabel]}>
      {label}
    </Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 58,
    borderRadius: radius.lg,
    borderCurve: "continuous",
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    boxShadow: `${shadows.soft}, inset 0px 1px 0px ${colors.lightEdge}`,
  },
  selected: {
    backgroundColor: `${mid.lavender}80`,
    boxShadow: `0px 10px 28px ${mid.lavender}66, inset 0px 1px 0px ${colors.lightEdge}`,
  },
  dimmed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: fontWeights.medium,
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
  },
  selectedLabel: {
    fontFamily: fontWeights.semibold,
    color: colors.main,
  },
});
