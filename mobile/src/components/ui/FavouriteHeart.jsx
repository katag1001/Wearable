// The favourite heart on outfit cards and wardrobe items: a filled black
// heart when favourited, an outline otherwise. Position it with `style`.

import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet } from "react-native";

import { colors, radius, spacing } from "@core/theme/tokens.js";

export const FavouriteHeart = ({ favourite, onPress, size = 20, style }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={favourite ? "Remove from favourites" : "Add to favourites"}
    accessibilityState={{ selected: !!favourite }}
    hitSlop={10}
    style={[styles.heart, style]}
  >
    <Ionicons
      name={favourite ? "heart" : "heart-outline"}
      size={size}
      color={favourite ? colors.main : colors.muted}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  heart: {
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.pageBackground,
  },
});
