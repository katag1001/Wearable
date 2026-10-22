// The outfit worn today with its shoes, all the same size, filling the
// page. Underneath: "Change outfit" (bottom left) goes back to choosing,
// the shoe (bottom right) opens the shoe panel (onChangeShoes).
// Logic: useTodayLook (`today`).

import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import { ActionButton } from "./ActionButton";
import { OutfitImages } from "./OutfitImages";

export const WornToday = ({ today, onChangeShoes }) => {
  const outfit = today.wornOutfit;

  return (
    <View style={styles.fill}>
      <OutfitImages match={outfit?.matchId} footwear={today.wornShoe} fit />

      <View style={styles.buttons}>
        <Pressable
          onPress={today.showOutfitPicker}
          accessibilityRole="button"
          accessibilityLabel="Change outfit"
          hitSlop={8}
          style={({ pressed }) => [styles.changeOutfit, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={18} color={colors.secondary} />
          <Text style={styles.changeOutfitText}>Change outfit</Text>
        </Pressable>

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
  fill: {
    flex: 1,
    gap: spacing.lg,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeOutfit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  changeOutfitText: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.5,
  },
});
