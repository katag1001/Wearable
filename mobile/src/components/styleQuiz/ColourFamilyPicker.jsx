// Favourite colour families (up to 3) as pie-chart tiles - used by the
// style quiz and Style Preferences. Once 3 are picked the others dim
// until one is unpicked. Tiles are pearl (no tint, so the colours read
// true); a chosen one gets the selection ring and the selected tick.

import { StyleSheet, Text } from "react-native";

import { MAX_FAVOURITE_COLOUR_FAMILIES } from "@core/utils/colourPalettes.js";

import { radii, shadows, space, surface, type } from "../../theme/soft";
import { PressableScale, SelectionHalo } from "../soft";
import { Grid, SelectedTick } from "../ui";
import { ColourPie } from "./ColourPie";

export const ColourFamilyPicker = ({ families, selected, onToggle }) => {
  const full = selected.length >= MAX_FAVOURITE_COLOUR_FAMILIES;

  return (
    <Grid columns={2}>
      {families.map((family) => {
        const isSelected = selected.includes(family.id);
        const dimmed = full && !isSelected;

        return (
          <PressableScale
            key={family.id}
            onPress={() => onToggle(family.id)}
            accessibilityRole="button"
            accessibilityLabel={`${family.name}: ${family.colours.join(", ")}`}
            accessibilityState={{ selected: isSelected, disabled: dimmed }}
            style={[styles.tile, dimmed && styles.dimmed]}
          >
            <ColourPie colours={family.colours} />
            <Text style={styles.name}>{family.name}</Text>

            {isSelected ? (
              <>
                <SelectionHalo radius={radii.tile} />
                <SelectedTick />
              </>
            ) : null}
          </PressableScale>
        );
      })}
    </Grid>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    gap: space.xs,
    paddingVertical: space.sm,
    borderRadius: radii.tile,
    borderCurve: "continuous",
    backgroundColor: surface.pearl,
    boxShadow: shadows.raised,
  },
  dimmed: {
    opacity: 0.45,
  },
  name: type.menuLabel,
});
