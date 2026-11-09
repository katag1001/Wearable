// An outfit's favourite heart with the broken heart (mark two of its items
// as a mismatch) straight underneath - in an outfit card's corner (small)
// and the outfit screen's (regular). Position it with `style`.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View } from "react-native";

import { space } from "../../theme/soft";
import { IconButton } from "../soft/IconButton";
import { FavouriteHeart } from "../ui/FavouriteHeart";

export const OutfitHearts = ({ favourite, onFavourite, onMismatch, size = "regular", style }) => (
  <View style={[styles.hearts, style]}>
    <FavouriteHeart favourite={favourite} onPress={onFavourite} size={size} />
    <IconButton
      icon="heart-broken-outline"
      iconSet={MaterialCommunityIcons}
      label="Mismatch"
      onPress={onMismatch}
      size={size}
      tone="quiet"
      hitSlop={10}
    />
  </View>
);

const styles = StyleSheet.create({
  hearts: {
    alignItems: "center",
    gap: space.xs,
  },
});
