// An outfit's clothes as large photos, laid out the way they're worn:
// tops then outerwear on the upper row, one-pieces and bottoms centred
// underneath (outfitRows). Each photo is half the width, so a row holds two
// and a fuller one wraps; a lone item is full width. `match` is a
// populated match.
//
// The photos get exact pixel sizes from the measured row width: a
// percentage width + aspectRatio inside a wrapping row in a scroll view
// can lay out with no height, so nothing shows.

import { useState } from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@core/theme/tokens.js";
import { outfitRows } from "@core/today/outfitRows.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

const PHOTO_ASPECT = 4 / 3; // height / width
const PHOTO_SCALE = 0.95;

export const OutfitImages = ({ match }) => {
  const [rowWidth, setRowWidth] = useState(0);

  const clothes = (match?.clothes || []).filter((item) => item?.imageUrl);
  const rows = outfitRows(clothes);

  const columns = clothes.length === 1 ? 1 : 2;
  // Rounded down and a touch under the full share, so two always fit side
  // by side - an exact fit can wrap from sub-pixel rounding.
  const photoWidth = Math.floor(
    ((rowWidth - spacing.sm * (columns - 1)) / columns) * PHOTO_SCALE
  );

  return (
    <View
      style={styles.outfit}
      onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
    >
      {rowWidth > 0 &&
        rows.map((row) => (
          <View key={row[0]._id} style={styles.row}>
            {row.map((item) => (
              <Image
                key={item._id}
                source={{ uri: getImageUrl(item.imageUrl, 800) }}
                style={[
                  styles.image,
                  { width: photoWidth, height: photoWidth * PHOTO_ASPECT },
                ]}
                contentFit="contain"
                transition={150}
                accessibilityLabel={item.name}
              />
            ))}
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  outfit: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  image: {
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
});
