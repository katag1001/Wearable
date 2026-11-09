// A large tappable answer ("More feminine", "Analyse my photos"...): the
// house box like Profile's menu boxes, its answer as a light name on the
// left. Selected, it fills with the selected lilac (as a chip does); the
// words never change weight, so nothing shifts.

import { StyleSheet, Text } from "react-native";

import { colors } from "../../theme/tokens";
import { houseBox, space, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

export const ChoiceCard = ({ label, selected = false, onPress, disabled }) => (
  <PressableScale
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ selected, disabled }}
    style={[styles.card, selected && styles.selected, disabled && styles.dimmed]}
  >
    <Text style={styles.label}>{label}</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 58,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    justifyContent: "center",
    ...houseBox,
  },
  selected: {
    backgroundColor: colors.selected,
  },
  dimmed: {
    opacity: 0.6,
  },
  label: type.menuLabel,
});
