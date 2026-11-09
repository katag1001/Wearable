// One outfit in the list, for the two-column grid: its items laid out the
// way they're worn (tops over bottoms, as on Today) in a card (ui/cardBox),
// with a heart to favourite it and,
// under it, the broken heart to mark two of its items as a mismatch
// (onMismatch opens the outfit screen's picker). The
// temperature, seasons and tags are on the outfit screen. Tap to open the
// outfit screen; long-press to select (then taps select too). Card
// actions: useMatchCard (shared with the web).
//
// `width` is the column's width. The card's height follows from it and
// the outfit (outfitCardHeight), so the grid can place cards before they
// draw.

import { StyleSheet } from "react-native";

import { useMatchCard } from "@core/hooks/useMatchCard.js";

import { radii } from "../../theme/soft";
import { PressableScale, SelectionHalo } from "../soft";
import { OutfitImages, outfitImagesHeight } from "../today/OutfitImages";
import { SelectedTick } from "../ui";
import {
  CARD_PADDING,
  cardBox,
  cardContentWidth,
  cardHeart,
} from "../ui/cardBox";
import { OutfitHearts } from "./OutfitHearts";

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
  onMismatch,
  onToggleSelect,
  onFavouriteToggle,
  onChanged,
  onError,
}) => {
  const card = useMatchCard({ match, onChanged, onFavouriteToggle, onError });

  return (
    <PressableScale
      onPress={() => (selectMode ? onToggleSelect(match._id) : onEdit(match))}
      onLongPress={() => onToggleSelect(match._id)}
      accessibilityRole="button"
      accessibilityLabel="Outfit"
      accessibilityHint={selectMode ? "Selects the outfit" : "Opens the outfit"}
      accessibilityState={{ selected }}
      style={[styles.card, { width, height: outfitCardHeight(match, width) }]}
    >
      <OutfitImages
        match={match}
        width={cardContentWidth(width)}
        imageSize={300}
        imageStyle={styles.photo}
      />

      {/* The heart, with the broken heart straight underneath. */}
      <OutfitHearts
        favourite={match.favourite}
        onFavourite={card.toggleFavourite}
        onMismatch={onMismatch}
        size="small"
        style={cardHeart}
      />

      {selected ? <SelectionHalo radius={radii.card} /> : null}

      {selectMode && <SelectedTick checked={selected} />}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: cardBox,
  photo: {
    backgroundColor: "transparent",
  },
});
