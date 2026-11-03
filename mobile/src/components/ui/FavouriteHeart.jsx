// The favourite heart on outfit cards and wardrobe items: a filled blush
// heart when favourited (blush = loved), a soft outline otherwise, on a
// small translucent white circle. Position it with `style`.

import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet } from "react-native";

import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { deep } from "../../theme/soft";

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
      color={favourite ? deep.blush : colors.muted}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  heart: {
    padding: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.cardBackground,
    boxShadow: shadows.soft,
  },
});
