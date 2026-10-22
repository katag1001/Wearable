// One outfit in the list: its items' photos, temperature range, seasons
// and tags, with a heart to favourite it. Tap to open the outfit screen;
// long-press to select (then taps select too). Card actions: useMatchCard
// (shared with the web).

import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useMatchCard } from "@core/hooks/useMatchCard.js";
import {
  formatMatchSeasons,
  formatMatchTemperature,
  formatTightsTemperature,
} from "@core/matches/matchFields.js";
import {
  colors,
  fontSizes,
  radius,
  spacing,
} from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { Card, FavouriteHeart } from "../ui";

export const OutfitCard = ({
  match,
  selected,
  selectMode,
  onEdit,
  onToggleSelect,
  onFavouriteToggle,
  onChanged,
  onError,
}) => {
  const card = useMatchCard({ match, onChanged, onFavouriteToggle, onError });

  const clothes = (match.clothes || []).filter((item) => item?.imageUrl);

  return (
    <Pressable
      onPress={() => (selectMode ? onToggleSelect(match._id) : onEdit(match))}
      onLongPress={() => onToggleSelect(match._id)}
      accessibilityRole="button"
      accessibilityLabel="Outfit"
      accessibilityHint={selectMode ? "Selects the outfit" : "Opens the outfit"}
      accessibilityState={{ selected }}
    >
      <Card style={[styles.card, selected && styles.selected]}>
        <View style={styles.images}>
          {clothes.map((item) => (
            <Image
              key={item._id}
              source={getImageUrl(item.imageUrl, 300)}
              style={styles.image}
              contentFit="contain"
              transition={150}
              accessibilityLabel={item.name}
            />
          ))}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.info}>
            <Text style={styles.temperature}>
              {formatMatchTemperature(match)}
            </Text>
            {formatTightsTemperature(match) ? (
              <Text style={styles.seasons}>{formatTightsTemperature(match)}</Text>
            ) : null}
            <Text style={styles.seasons}>{formatMatchSeasons(match)}</Text>
          </View>

          {match.tags?.length ? (
            <Text style={styles.tags} numberOfLines={2}>
              {match.tags.join(" · ")}
            </Text>
          ) : null}
        </View>

        <FavouriteHeart
          favourite={match.favourite}
          onPress={card.toggleFavourite}
          style={styles.heart}
        />

        {selectMode && (
          <View style={[styles.tick, selected && styles.tickOn]}>
            {selected && (
              <Feather name="check" size={14} color={colors.inverse} />
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  selected: {
    borderColor: colors.main,
    borderWidth: 2,
  },
  images: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  image: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    backgroundColor: colors.imageBackground,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    gap: 2,
  },
  temperature: {
    fontSize: fontSizes.body,
    color: colors.main,
  },
  seasons: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  tags: {
    flexShrink: 1,
    marginLeft: spacing.md,
    fontSize: fontSizes.small,
    color: colors.secondary,
    textAlign: "right",
  },
  heart: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
  tick: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.main,
    backgroundColor: colors.pageBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: {
    backgroundColor: colors.main,
  },
});
