// Choosing today's outfit: the sorted outfits one at a time, each with its
// shoes, swiped like cards (next rejects the one being left). The heart
// wears the outfit and its shoes today (playing onCelebrate), the shoe
// opens Change shoes (onChangeShoes), the bin deletes the outfit.
// Logic: useTodayLook.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Alert, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import { ActionButton, ActionRow } from "./ActionButton";
import { OutfitImages } from "./OutfitImages";
import { SwipeDeck } from "./SwipeDeck";

export const OutfitPicker = ({ today, onCelebrate, onChangeShoes }) => {
  const { filteredOutfits, selectedOutfit, selectedShoe } = today;

  const confirmDelete = () =>
    Alert.alert(
      "Delete outfit",
      "Are you sure you want to delete this outfit permanently? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: today.deleteCurrentOutfit,
        },
      ]
    );

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
        >
          <OutfitImages match={selectedOutfit.matchId} footwear={selectedShoe} />
        </SwipeDeck>
      </View>

      <ActionRow>
        <ActionButton
          icon="trash-2"
          label="Delete outfit"
          onPress={confirmDelete}
          loading={today.deleting}
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
  empty: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
