// Favourite colour palettes as swatch tiles - used by the style quiz and
// Style Preferences. Outfits that fit a favourite palette score higher;
// the others are still suggested.

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@core/theme/tokens.js";
import { colourHex } from "@core/utils/colourPalettes.js";

import { Grid } from "../ui";

export const PalettePicker = ({ palettes, selected, onToggle }) => (
  <Grid columns={2}>
    {palettes.map((palette) => {
      const isSelected = selected.includes(palette.id);

      return (
        <Pressable
          key={palette.id}
          onPress={() => onToggle(palette.id)}
          accessibilityRole="button"
          accessibilityLabel={palette.colours.join(", ")}
          accessibilityState={{ selected: isSelected }}
          style={({ pressed }) => [
            styles.tile,
            isSelected && styles.selected,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.swatches}>
            {palette.colours.map((colour) => (
              <View
                key={colour}
                style={[styles.swatch, { backgroundColor: colourHex(colour) }]}
              />
            ))}
          </View>

          {isSelected ? (
            <View style={styles.check}>
              <Feather name="check" size={12} color={colors.inverse} />
            </View>
          ) : null}
        </Pressable>
      );
    })}
  </Grid>
);

const styles = StyleSheet.create({
  tile: {
    padding: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  selected: {
    borderColor: colors.main,
  },
  pressed: {
    opacity: 0.8,
  },
  swatches: {
    flexDirection: "row",
    height: 40,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  swatch: {
    flex: 1,
  },
  check: {
    position: "absolute",
    top: -spacing.xs,
    right: -spacing.xs,
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
});
