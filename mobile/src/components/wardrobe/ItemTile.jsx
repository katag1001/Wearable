// One wardrobe item in the grid: its photo (a small Cloudinary copy,
// cached by expo-image) and name. Tap to edit.

import { Image } from "expo-image";
import { Pressable, StyleSheet, Text } from "react-native";

import {
  colors,
  fontSizes,
  radius,
  spacing,
} from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

export const ItemTile = ({ item, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Edit ${item.name}`}
    style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
  >
    <Image
      source={item.imageUrl ? getImageUrl(item.imageUrl, 400) : null}
      style={styles.image}
      contentFit="contain"
      transition={150}
    />
    <Text style={styles.name} numberOfLines={1}>
      {item.name}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  // Two to a row (the list puts the space between them).
  tile: {
    width: "48%",
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: "100%",
    aspectRatio: 5 / 6,
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  name: {
    fontSize: fontSizes.small,
    color: colors.main,
  },
});
