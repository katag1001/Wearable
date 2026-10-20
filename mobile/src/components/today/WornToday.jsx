// The outfit worn today with its shoes, all the same size, filling the
// page. "Change shoes" opens the shoe panel (onChangeShoes), "Change
// outfit" goes back to choosing. Logic: useTodayLook (`today`).

import { StyleSheet, View } from "react-native";

import { spacing } from "@core/theme/tokens.js";

import { Button } from "../ui";
import { OutfitImages } from "./OutfitImages";

const SmallButton = ({ label, onPress }) => (
  <Button
    label={label}
    variant="secondary"
    onPress={onPress}
    style={styles.small}
  />
);

export const WornToday = ({ today, onChangeShoes }) => {
  const outfit = today.wornOutfit;

  return (
    <View style={styles.fill}>
      <View style={styles.buttons}>
        {today.footwear.hasFootwear ? (
          <SmallButton
            label="Change shoes"
            onPress={onChangeShoes}
          />
        ) : null}
        <SmallButton label="Change outfit" onPress={today.showOutfitPicker} />
      </View>

      <OutfitImages match={outfit?.matchId} footwear={today.wornShoe} fit />
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
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  // Compact, so they don't eat into the photos' space.
  small: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
});
