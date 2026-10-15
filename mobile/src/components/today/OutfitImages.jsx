// An outfit's clothes as large photos, two to a row, with its tags'
// icons underneath. `match` is a populated match.
//
// The photos get exact pixel sizes from the measured row width: a
// percentage width + aspectRatio inside a wrapping row in a scroll view
// can lay out with no height, so nothing shows.

import { useState } from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import { getTagOption } from "@core/utils/tagOptions.js";

const PHOTO_ASPECT = 4 / 3; // height / width

export const OutfitImages = ({ match }) => {
  const [rowWidth, setRowWidth] = useState(0);

  const clothes = (match?.clothes || []).filter((item) => item?.imageUrl);
  const tags = (match?.tags || []).map(getTagOption).filter(Boolean);

  const columns = clothes.length === 1 ? 1 : 2;
  const photoWidth = (rowWidth - spacing.sm * (columns - 1)) / columns;

  return (
    <View style={styles.outfit}>
      <View
        style={styles.images}
        onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
      >
        {rowWidth > 0 &&
          clothes.map((item) => (
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

      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <Image
              key={tag.name}
              source={tag.image}
              style={styles.tag}
              contentFit="contain"
              accessibilityLabel={tag.name}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outfit: {
    gap: spacing.sm,
  },
  images: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  image: {
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  tags: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tag: {
    width: 26,
    height: 26,
  },
});
