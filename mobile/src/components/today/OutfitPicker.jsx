// Choosing today's outfit: the sorted outfits one at a time, swiped like
// cards (next rejects the one being left). The heart wears it today, the
// bin deletes it. Logic: useToday.

import Feather from "@expo/vector-icons/Feather";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import { OutfitImages } from "./OutfitImages";
import { SwipeDeck } from "./SwipeDeck";

const ActionButton = ({ icon, label, onPress, loading }) => (
  <Pressable
    onPress={onPress}
    disabled={loading}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
  >
    {loading ? (
      <ActivityIndicator color={colors.main} />
    ) : (
      <Feather name={icon} size={28} color={colors.main} />
    )}
  </Pressable>
);

export const OutfitPicker = ({ today }) => {
  const { filteredOutfits, selectedOutfit } = today;

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
          <OutfitImages match={selectedOutfit.matchId} />
        </SwipeDeck>
      </View>

      <View style={styles.actions}>
        <ActionButton
          icon="trash-2"
          label="Delete outfit"
          onPress={confirmDelete}
          loading={today.deleting}
        />
        <ActionButton
          icon="heart"
          label="Wear this outfit today"
          onPress={today.markAsWornToday}
        />
      </View>
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
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xxl,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.imageBackground,
  },
  pressed: {
    opacity: 0.6,
  },
  empty: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
