// Choosing today's outfit: the sorted outfits one at a time, each with its
// shoes, swiped like cards (next rejects the one being left). Tapping the
// outfit opens it full screen to change its details (and rate it - no
// stars on this page for now). The heart
// wears the outfit and its shoes today (playing onCelebrate), the shoe
// opens Change shoes (onChangeShoes), the broken heart opens "not this
// outfit" (onNotThisOutfit - too hot, too cold or a mismatch).
// Logic: useTodayLook.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { handOverOutfit } from "../outfits/outfitHandoff";
import { space, type } from "../../theme/soft";
import { ActionButton } from "./ActionButton";
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
      {/* Only on today's list thanks to its tights range - above the
          outfit, so the photos can run to the bottom */}
      {selectedOutfit.withTights ? (
        <Text style={styles.tights}>Wear with tights</Text>
      ) : null}

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
            <OutfitImages
              match={selectedOutfit.matchId}
              footwear={selectedShoe}
              fit
              imageStyle={styles.photo}
            />
          </Pressable>
        </SwipeDeck>
      </View>

      {/* Over the bottom of the photos: the two hearts stacked in the
          bottom left corner, the shoe in the bottom right. Touches between
          them still reach the outfit (box-none). No stars here for now. */}
      <View style={styles.actions} pointerEvents="box-none">
        <View style={styles.hearts}>
          <ActionButton
            icon="heart-broken-outline"
            iconSet={MaterialCommunityIcons}
            label="Not this outfit"
            onPress={onNotThisOutfit}
          />
          <ActionButton
            icon="heart-outline"
            iconSet={MaterialCommunityIcons}
            label="Wear this outfit today"
            onPress={wear}
            loading={today.wearing}
          />
        </View>

        {today.footwear.hasFootwear ? (
          <ActionButton
            icon="shoe-sneaker"
            iconSet={MaterialCommunityIcons}
            label="Change shoes"
            onPress={onChangeShoes}
            small
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    flex: 1,
    gap: space.sm,
  },
  deck: {
    flex: 1,
    justifyContent: "center",
  },
  // No box: the outfit sits straight on the page's white middle.
  card: {
    flex: 1,
  },
  // The photos have their backgrounds removed; no tile behind them.
  photo: {
    backgroundColor: "transparent",
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: space.sm,
    // Above the swipe deck's side arrows (zIndex / elevation 1), which run
    // the full height of the outfit and would otherwise take the taps.
    zIndex: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  hearts: {
    gap: space.sm,
  },
  tights: {
    ...type.eyebrow,
    textAlign: "center",
  },
  empty: {
    ...type.body,
    textAlign: "center",
    paddingVertical: space.lg,
  },
});
