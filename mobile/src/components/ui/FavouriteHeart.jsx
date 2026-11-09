// The favourite heart on outfit cards, wardrobe items and the outfit
// screen: a plain icon (soft/IconButton), no circle. Favourites are a
// "loved" job, so a favourited heart is filled blush (hearts.favourite),
// as Today's heart button is once an outfit is worn; otherwise a quiet
// outline. The same heart set as the broken heart beside it. Position it
// with `style`.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { hearts } from "../../theme/soft";
import { IconButton } from "../soft/IconButton";

export const FavouriteHeart = ({ favourite, onPress, size = "regular", style }) => (
  <IconButton
    icon={favourite ? "heart" : "heart-outline"}
    iconSet={MaterialCommunityIcons}
    label={favourite ? "Remove from favourites" : "Add to favourites"}
    accessibilityState={{ selected: !!favourite }}
    onPress={onPress}
    size={size}
    tone="quiet"
    color={favourite ? hearts.favourite : undefined}
    hitSlop={10}
    style={style}
  />
);
