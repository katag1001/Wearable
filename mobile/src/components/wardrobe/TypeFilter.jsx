// The wardrobe's type buttons as a sideways-scrolling chip row, and the
// selected type's subtypes (only ones the user owns) on a row below.
// Phones have no hover, so subtypes show for the selected type only.

import { View } from "react-native";

import { spacing } from "@core/theme/tokens.js";
import {
  WARDROBE_TYPES,
  WARDROBE_TYPE_TITLES,
} from "@core/wardrobe/wardrobeTypes.js";

import { Chip, ChipRow } from "../ui";

export const TypeFilter = ({ wardrobe }) => {
  const { selectedType, selectedSubtypes = [] } = wardrobe;

  const subtypes = selectedType
    ? wardrobe.subtypesByType[selectedType] || []
    : [];

  return (
    <View style={{ gap: spacing.sm }}>
      <ChipRow scroll>
        {WARDROBE_TYPES.map((type) => (
          <Chip
            key={type}
            label={WARDROBE_TYPE_TITLES[type]}
            selected={selectedType === type}
            onPress={() => wardrobe.toggleType(type)}
          />
        ))}
      </ChipRow>

      {subtypes.length > 0 && (
        <ChipRow scroll>
          {subtypes.map((subtype) => (
            <Chip
              key={subtype}
              label={subtype}
              selected={selectedSubtypes.includes(subtype)}
              onPress={() => wardrobe.toggleSubtype(selectedType, subtype)}
            />
          ))}
        </ChipRow>
      )}
    </View>
  );
};
