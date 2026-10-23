// Choosing today's outfit: the sorted outfits one at a time, each with its
// shoes, swiped like cards (next rejects the one being left). Tapping the
// outfit opens it full screen to change its details. The stars rate it
// (saved once it's left, or worn - useToday). The heart
// wears the outfit and its shoes today (playing onCelebrate), the shoe
// opens Change shoes (onChangeShoes), the broken heart opens "not this
// outfit" (onNotThisOutfit - too hot, too cold or a mismatch).
// Logic: useTodayLook.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import { handOverOutfit } from "../outfits/outfitHandoff";
import { StarRating } from "../ui";
import { ActionButton, ActionRow } from "./ActionButton";
import { OutfitImages } from "./OutfitImages";
import { SwipeDeck } from "./SwipeDeck";

export const OutfitPicker = ({ today, onCelebrate, onChangeShoes, onNotThisOutfit }) => {
  const { filteredOutfits, selectedOutfit, selectedShoe } = today;

  const openOutfit = () => {
    // With the stars picked here, which the outfit screen saves.
    handOverOutfit(selectedOutfit.matchId, selectedShoe, today.selectedRating);
    router.push({ pathname: "/outfit", params: { from: "today" } });
  };

  const wear = async () => {
    if (await today.markAsWornToday()) {
      onCelebrate();
    }
  };

  if (!selectedOutfit) {
    return <Text style={styles.empty}>No outfits saved for today.</Text>;
  }

  return (
    <View style={styles.picker}>
      <View style={styles.deck}>
        <SwipeDeck
          enabled={filteredOutfits.length > 1}
          onNext={today.goNext}
          onPrev={today.goPrev}
          noun="outfit"
          fill
        >
          {/* A tap (not a swipe) opens the outfit to change its details. */}
          <Pressable
            onPress={openOutfit}
            accessibilityRole="button"
            accessibilityLabel="Outfit"
            accessibilityHint="Opens the outfit"
            style={styles.card}
          >
            {/* Shrinks to fit, so the page never scrolls. */}
            <OutfitImages match={selectedOutfit.matchId} footwear={selectedShoe} fit />
          </Pressable>
        </SwipeDeck>
      </View>

      {/* Only on today's list thanks to its tights range */}
      {selectedOutfit.withTights ? (
        <Text style={styles.tights}>Wear with tights</Text>
      ) : null}

      <StarRating rating={today.selectedRating} onChange={today.rateSelected} />

      <ActionRow>
        <ActionButton
          icon="heart-broken-outline"
          iconSet={MaterialCommunityIcons}
          label="Not this outfit"
          onPress={onNotThisOutfit}
        />
        {today.footwear.hasFootwear ? (
          <ActionButton
            icon="shoe-sneaker"
            iconSet={MaterialCommunityIcons}
            label="Change shoes"
            onPress={onChangeShoes}
            small
          />
        ) : null}
        <ActionButton
          icon="heart"
          label="Wear this outfit today"
          onPress={wear}
          loading={today.wearing}
        />
      </ActionRow>
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    flex: 1,
    gap: spacing.lg,
  },
  deck: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    flex: 1,
  },
  tights: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
  },
  empty: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
