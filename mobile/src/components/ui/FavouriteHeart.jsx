// The favourite heart on outfit cards, wardrobe items and the outfit
// screen: just the icon, no circle - filled in the selected lavender (as
// selected chips) when favourited, a soft outline otherwise. Position it
// with `style`.

import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";

import { colors } from "../../theme/tokens";

export const FavouriteHeart = ({ favourite, onPress, size = 20, style }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={favourite ? "Remove from favourites" : "Add to favourites"}
    accessibilityState={{ selected: !!favourite }}
    hitSlop={10}
    style={style}
  >
    <Ionicons
      name={favourite ? "heart" : "heart-outline"}
      size={size}
      color={favourite ? colors.selected : colors.muted}
    />
  </Pressable>
);
