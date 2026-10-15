// "This season" under Today: a sideways row of this season's clothes and
// one of its outfits, each with "See all". Logic: useSeasonPreviews
// (shared with the web homepage).

import { useCallback } from "react";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { useSeasonPreviews } from "@core/hooks/useSeasonPreviews.js";
import { colors, radius, spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { Button, SectionTitle } from "../ui";

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const Row = ({ children }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.row}>{children}</View>
  </ScrollView>
);

export const SeasonPreviews = () => {
  const previews = useSeasonPreviews();

  // Changes made on other tabs show when coming back (cached copies
  // appear straight away, then refresh).
  useFocusEffect(
    useCallback(() => {
      previews.reloadClothes();
      previews.reloadOutfits();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const season = capitalise(previews.season);

  return (
    <>
      {previews.clothes.length > 0 && (
        <>
          <SectionTitle
            title={`${season} clothes`}
            right={
              <Button
                label="See all"
                variant="text"
                onPress={() => router.navigate("/wardrobe")}
              />
            }
          />
          <Row>
            {previews.clothes.map((item) => (
              <Image
                key={item._id}
                source={item.imageUrl ? getImageUrl(item.imageUrl, 300) : null}
                style={styles.item}
                contentFit="contain"
                accessibilityLabel={item.name}
              />
            ))}
          </Row>
        </>
      )}

      {previews.outfits.length > 0 && (
        <>
          <SectionTitle
            title={`${season} outfits`}
            right={
              <Button
                label="See all"
                variant="text"
                onPress={() => router.navigate("/outfits")}
              />
            }
          />
          <Row>
            {previews.outfits.map((match) => (
              <View key={match._id} style={styles.outfit}>
                {(match.clothes || [])
                  .filter((item) => item?.imageUrl)
                  .slice(0, 4)
                  .map((item) => (
                    <Image
                      key={item._id}
                      source={getImageUrl(item.imageUrl, 200)}
                      style={styles.outfitItem}
                      contentFit="contain"
                    />
                  ))}
              </View>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  item: {
    width: 104,
    height: 128,
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  outfit: {
    width: 150,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    padding: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  outfitItem: {
    width: 69,
    height: 69,
  },
});
