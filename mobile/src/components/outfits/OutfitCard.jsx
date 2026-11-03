// One outfit in the list, for the two-column grid: its items laid out the
// way they're worn (tops over bottoms, as on Today) in a soft white box -
// the search box's fill, no border - with a heart to favourite it. The
// temperature, seasons and tags are on the outfit screen. Tap to open the
// outfit screen; long-press to select (then taps select too). Card
// actions: useMatchCard (shared with the web).
//
// `width` is the column's width. The card's height follows from it and
// the outfit (outfitCardHeight), so the grid can place cards before they
// draw.

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View } from "react-native";

import { useMatchCard } from "@core/hooks/useMatchCard.js";

import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { mid } from "../../theme/soft";
import { SelectionHalo } from "../soft";
import { OutfitImages, outfitImagesHeight } from "../today/OutfitImages";
import { FavouriteHeart } from "../ui";
import {
  CARD_HEART_SIZE,
  CARD_PADDING,
  cardBox,
  cardContentWidth,
  cardHeart,
} from "../ui/cardBox";

export const outfitCardHeight = (match, width) =>
  CARD_PADDING.top +
  outfitImagesHeight(match, cardContentWidth(width)) +
  CARD_PADDING.bottom;

export const OutfitCard = ({
  match,
  width,
  selected,
  selectMode,
  onEdit,
  onToggleSelect,
  onFavouriteToggle,
  onChanged,
  onError,
}) => {
  const card = useMatchCard({ match, onChanged, onFavouriteToggle, onError });

  return (
    <Pressable
      onPress={() => (selectMode ? onToggleSelect(match._id) : onEdit(match))}
      onLongPress={() => onToggleSelect(match._id)}
      accessibilityRole="button"
      accessibilityLabel="Outfit"
      accessibilityHint={selectMode ? "Selects the outfit" : "Opens the outfit"}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        { width, height: outfitCardHeight(match, width) },
        pressed && styles.pressed,
      ]}
    >
      <OutfitImages
        match={match}
        width={cardContentWidth(width)}
        imageSize={300}
        imageStyle={styles.photo}
      />

      <FavouriteHeart
        favourite={match.favourite}
        onPress={card.toggleFavourite}
        size={CARD_HEART_SIZE}
        style={cardHeart}
      />

      {selected ? <SelectionHalo radius={radius.lg} /> : null}

      {selectMode && (
        <View style={[styles.tick, selected && styles.tickOn]}>
          {selected && <Feather name="check" size={13} color={colors.inverse} />}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: cardBox,
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  photo: {
    backgroundColor: "transparent",
  },
  tick: {
    position: "absolute",
    top: spacing.sm + 2,
    left: spacing.sm + 2,
    width: 22,
    height: 22,
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
