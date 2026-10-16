// The outfit worn today, in one of two views:
//  - choosing shoes: the outfit small at the top ("Change outfit"), the
//    shoes to swipe through below.
//  - the finished look: once shoes are picked, the clothes and shoes
//    together, all the same size ("Change shoes", "Change outfit").
// Picking shoes plays onCelebrate (the confetti) and switches to the
// finished look; it opens there if shoes are already picked today.
// Logic: useToday (`today`), useTodayFootwear.

import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { useTodayFootwear } from "@core/hooks/useTodayFootwear.js";
import { spacing } from "@core/theme/tokens.js";

import { Button, Loading } from "../ui";
import { OutfitImages } from "./OutfitImages";
import { ShoeBox } from "./ShoeBox";

// The outfit's share of the screen height while choosing shoes; the shoes
// get the rest.
const OUTFIT_SHARE = 0.3;

const SmallButton = ({ label, onPress }) => (
  <Button
    label={label}
    variant="secondary"
    onPress={onPress}
    style={styles.small}
  />
);

export const WornToday = ({ today, onCelebrate }) => {
  const { height: windowHeight } = useWindowDimensions();
  const outfit = today.wornOutfit;
  const shoes = useTodayFootwear({ outfit, todayTag: today.todayTag });

  // "Change shoes" pressed - back to the shoes, even with some picked.
  const [choosingShoes, setChoosingShoes] = useState(false);

  const wear = async () => {
    // Already today's shoes - nothing to save, just show the look.
    if (shoes.isWearingCurrent) {
      setChoosingShoes(false);
      return;
    }

    if (await shoes.wearCurrent()) {
      onCelebrate();
      setChoosingShoes(false);
    }
  };

  if (shoes.hasWornShoe && !choosingShoes) {
    return (
      <View style={styles.fill}>
        <View style={styles.buttons}>
          <SmallButton
            label="Change shoes"
            onPress={() => setChoosingShoes(true)}
          />
          <SmallButton label="Change outfit" onPress={today.showOutfitPicker} />
        </View>

        {shoes.wornShoe ? (
          <OutfitImages match={outfit?.matchId} footwear={shoes.wornShoe} fit />
        ) : (
          <Loading text="Loading today's look..." />
        )}
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <View
        style={[
          styles.outfit,
          { height: Math.round(windowHeight * OUTFIT_SHARE) },
        ]}
      >
        <View style={styles.buttons}>
          <SmallButton label="Change outfit" onPress={today.showOutfitPicker} />
        </View>
        <OutfitImages match={outfit?.matchId} fit />
      </View>

      <View style={styles.fill}>
        <ShoeBox shoes={shoes} onWear={wear} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    gap: spacing.lg,
  },
  outfit: {
    gap: spacing.sm,
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
