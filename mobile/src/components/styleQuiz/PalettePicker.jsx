// Favourite colour palettes as swatch tiles - used by the style quiz and
// Style Preferences. Outfits that fit a favourite palette score higher;
// the others are still suggested. Tiles are pearl (no tint, so the
// colours read true); a chosen one gets the iridescent halo.

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View } from "react-native";

import { colourHex } from "@core/utils/colourPalettes.js";

import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { surface } from "../../theme/soft";
import { SelectionHalo } from "../soft";
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
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
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
            <>
              <SelectionHalo radius={radius.md} />
              <View style={styles.check}>
                <Feather name="check" size={12} color={colors.main} />
              </View>
            </>
          ) : null}
        </Pressable>
      );
    })}
  </Grid>
);

const styles = StyleSheet.create({
  tile: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderCurve: "continuous",
    backgroundColor: surface.pearl,
    boxShadow: shadows.soft,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
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
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.inverse,
    boxShadow: shadows.soft,
    alignItems: "center",
    justifyContent: "center",
  },
});
