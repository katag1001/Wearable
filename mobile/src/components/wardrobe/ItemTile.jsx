// One wardrobe item in the grid, in the same box as the outfit cards
// (ui/cardBox): its photo (a small Cloudinary copy, cached by expo-image)
// small and centred, no name - that's on its edit screen. Tap to edit.
// Clothes (not footwear) get the heart in the corner - outfits with a
// favourite item score higher (useItemFavourite). `width` is the column's.

import { Image } from "expo-image";
import { Pressable, StyleSheet } from "react-native";

import { useItemFavourite } from "@core/hooks/useItemFavourite.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { FavouriteHeart } from "../ui";
import {
  CARD_HEART_SIZE,
  cardBox,
  cardContentWidth,
  cardHeart,
} from "../ui/cardBox";

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
      size={CARD_HEART_SIZE}
      style={cardHeart}
    />
  );
};

// onFavouriteToggled(id, favourite) / onFavouriteError(message): given
// only for clothes; without them there's no heart.
export const ItemTile = ({
  item,
  width,
  onPress,
  onFavouriteToggled,
  onFavouriteError,
}) => {
  const photoSize = cardContentWidth(width);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${item.name}`}
      style={({ pressed }) => [cardBox, { width }, pressed && styles.pressed]}
    >
      <Image
        source={item.imageUrl ? getImageUrl(item.imageUrl, 400) : null}
        style={{ width: photoSize, height: photoSize }}
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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
