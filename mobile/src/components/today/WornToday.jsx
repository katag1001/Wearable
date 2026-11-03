// The outfit worn today with its shoes, all the same size, filling the
// page. Underneath: "Change outfit" (bottom left) goes back to
// choosing, the shoe (bottom right) opens the shoe panel (onChangeShoes).
// Logic: useTodayLook (`today`).

import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { PressableScale } from "../soft";
import { ink, space, type } from "../../theme/soft";
import { ActionButton } from "./ActionButton";
import { OutfitImages } from "./OutfitImages";

export const WornToday = ({ today, onChangeShoes }) => {
  const outfit = today.wornOutfit;

  return (
    <View style={styles.fill}>
      <View style={styles.card}>
        <OutfitImages
          match={outfit?.matchId}
          footwear={today.wornShoe}
          fit
          imageStyle={styles.photo}
        />
      </View>

      <View style={styles.buttons}>
        <PressableScale
          onPress={today.showOutfitPicker}
          accessibilityRole="button"
          accessibilityLabel="Change outfit"
          hitSlop={8}
          style={styles.changeOutfit}
        >
          <Feather name="arrow-left" size={16} color={ink.main} />
          <Text style={styles.changeOutfitText}>Change outfit</Text>
        </PressableScale>

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
    gap: space.md,
  },
  // No box: the outfit sits straight on the page's white middle.
  card: {
    flex: 1,
  },
  // The photos have their backgrounds removed; no tile behind them.
  photo: {
    backgroundColor: "transparent",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeOutfit: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  changeOutfitText: {
    ...type.label,
  },
});
