// Stats: the most-worn outfits and clothes, all time or this year.
// Logic: useStats (shared with the web).

import { Image, StyleSheet, Text, View } from "react-native";

import { useStats } from "@core/hooks/useStats.js";
import { STATS_MODES, formatWornCount } from "@core/stats/topWorn.js";
import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import {
  Card,
  EmptyState,
  Grid,
  ImageTile,
  Loading,
  Screen,
  SectionTitle,
  SegmentedControl,
} from "../../components/ui";

const Rank = ({ index }) => <Text style={styles.rank}>#{index + 1}</Text>;

export default function StatsScreen() {
  const stats = useStats();

  if (stats.loading) {
    return <Loading text="Loading stats..." />;
  }

  if (stats.error) {
    return <EmptyState title="Couldn't load stats" text={stats.error} />;
  }

  const thisYear = stats.mode === "thisYear";

  return (
    <Screen edges={["bottom"]}>
      <SegmentedControl
        options={STATS_MODES}
        value={stats.mode}
        onChange={stats.setMode}
      />

      <SectionTitle title="Top outfits" />
      {stats.topOutfits.length > 0 ? (
        stats.topOutfits.map((outfit, index) => (
          <Card key={outfit._id}>
            <View style={styles.cardHeader}>
              <Rank index={index} />
              <Text style={styles.count}>
                {formatWornCount(outfit[stats.countField])}
              </Text>
            </View>

            <View style={styles.outfitImages}>
              {(outfit.clothes || [])
                .filter((item) => item?.imageUrl)
                .map((item) => (
                  <Image
                    key={item._id}
                    source={{ uri: getImageUrl(item.imageUrl, 200) }}
                    style={styles.outfitImage}
                    resizeMode="contain"
                    accessibilityLabel={item.name}
                  />
                ))}
            </View>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>
          {thisYear ? "No outfits worn this year." : "No outfits worn yet."}
        </Text>
      )}

      <SectionTitle title="Top clothes" />
      {stats.topClothes.length > 0 ? (
        <Grid columns={2}>
          {stats.topClothes.map((item, index) => (
            <View key={item._id} style={styles.clothing}>
              <ImageTile
                source={
                  item.imageUrl ? { uri: getImageUrl(item.imageUrl, 400) } : null
                }
                placeholder={item.name}
                resizeMode="contain"
              />
              <Rank index={index} />
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.count}>
                {formatWornCount(item[stats.countField])}
              </Text>
            </View>
          ))}
        </Grid>
      ) : (
        <Text style={styles.empty}>
          {thisYear ? "No clothes worn this year." : "No clothes worn yet."}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rank: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  count: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  outfitImages: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  outfitImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.imageBackground,
  },
  clothing: {
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSizes.body,
    color: colors.main,
  },
  empty: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
});
