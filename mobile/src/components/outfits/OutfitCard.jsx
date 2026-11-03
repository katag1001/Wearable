// One outfit in the list: just its items' photos, with a heart to
// favourite it - the temperature, seasons and tags are on the outfit
// screen. Tap to open the outfit screen;
// long-press to select (then taps select too). Card actions: useMatchCard
// (shared with the web).

import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { useMatchCard } from "@core/hooks/useMatchCard.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { mid } from "../../theme/soft";
import { SelectionHalo } from "../soft";
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
      <Card style={styles.card}>
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

        <FavouriteHeart
          favourite={match.favourite}
          onPress={card.toggleFavourite}
          style={styles.heart}
        />

        {selected ? <SelectionHalo radius={radius.xl} /> : null}

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
  // No card behind the outfit: it sits straight on the page.
  card: {
    padding: 0,
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  images: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  image: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    backgroundColor: colors.itemBackground,
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
    backgroundColor: colors.inverse,
    boxShadow: `${shadows.soft}, inset 0px 0px 0px 1.5px ${colors.hoverBorder}`,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: {
    backgroundColor: mid.lavender,
    boxShadow: shadows.soft,
  },
});
