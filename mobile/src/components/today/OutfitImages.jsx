// An outfit's clothes as large photos, two to a row, with its tags'
// icons underneath. `match` is a populated match.

import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import { getTagOption } from "@core/utils/tagOptions.js";

export const OutfitImages = ({ match }) => {
  const clothes = (match?.clothes || []).filter((item) => item?.imageUrl);
  const tags = (match?.tags || []).map(getTagOption).filter(Boolean);

  return (
    <View style={styles.outfit}>
      <View style={styles.images}>
        {clothes.map((item) => (
          <Image
            key={item._id}
            source={getImageUrl(item.imageUrl, 800)}
            style={[styles.image, clothes.length === 1 && styles.single]}
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  image: {
    width: "48.5%",
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  single: {
    width: "100%",
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
