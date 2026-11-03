// One wardrobe item in the grid: its photo (a small Cloudinary copy,
// cached by expo-image) and name. Tap to edit. Clothes (not footwear) get
// a heart - outfits with a favourite item score higher (useItemFavourite).

import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useItemFavourite } from "@core/hooks/useItemFavourite.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "../../theme/tokens";
import { FavouriteHeart } from "../ui";

const ItemHeart = ({ item, onToggled, onError }) => {
  const { favourite, toggleFavourite } = useItemFavourite({
    item,
    onToggled,
    onError,
  });

  return (
    <FavouriteHeart
      favourite={favourite}
      onPress={toggleFavourite}
      size={18}
      style={styles.heart}
    />
  );
};

// onFavouriteToggled(id, favourite) / onFavouriteError(message): given
// only for clothes; without them there's no heart.
export const ItemTile = ({
  item,
  onPress,
  onFavouriteToggled,
  onFavouriteError,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Edit ${item.name}`}
    style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
  >
    <View>
      <Image
        source={item.imageUrl ? getImageUrl(item.imageUrl, 400) : null}
        style={styles.image}
        contentFit="contain"
        transition={150}
      />

      {onFavouriteToggled && (
        <ItemHeart
          item={item}
          onToggled={onFavouriteToggled}
          onError={onFavouriteError}
        />
      )}
    </View>
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
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: "100%",
    aspectRatio: 5 / 6,
    borderRadius: radius.lg,
    borderCurve: "continuous",
    backgroundColor: colors.itemBackground,
  },
  heart: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  name: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.small,
    color: colors.main,
  },
});
