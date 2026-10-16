// The shoes for today's worn outfit, best first, swiped like cards (next
// lowers the pairing with the outfit). The heart picks them (onWear), the
// bin deletes them from the wardrobe. `shoes` is useTodayFootwear's result
// (shared with the web's shoe box), owned by WornToday.

import { Image } from "expo-image";
import { Alert, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { Loading } from "../ui";
import { ActionButton, ActionRow } from "./ActionButton";
import { SwipeDeck } from "./SwipeDeck";

export const ShoeBox = ({ shoes, onWear }) => {
  const { current } = shoes;

  if (shoes.error && shoes.loading) {
    return <Text style={styles.message}>{shoes.error}</Text>;
  }

  if (shoes.loading) {
    return <Loading text="Loading footwear..." />;
  }

  if (!current) {
    return (
      <Text style={styles.message}>
        Add footwear in your Wardrobe to get shoe suggestions here.
      </Text>
    );
  }

  const confirmDelete = () =>
    Alert.alert(
      "Delete shoes",
      `Are you sure you want to delete ${current.name} from your wardrobe permanently? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: shoes.deleteCurrent,
        },
      ]
    );

  return (
    <View style={styles.box}>
      <SwipeDeck
        enabled={shoes.shoes.length > 1}
        onNext={shoes.goNext}
        onPrev={shoes.goPrev}
        noun="shoes"
        fill
      >
        <Image
          source={current.imageUrl ? getImageUrl(current.imageUrl, 600) : null}
          style={styles.image}
          contentFit="contain"
          transition={150}
          accessibilityLabel={current.name}
        />
      </SwipeDeck>

      {shoes.error ? <Text style={styles.message}>{shoes.error}</Text> : null}

      <ActionRow>
        <ActionButton
          icon="trash-2"
          label="Delete shoes"
          onPress={confirmDelete}
          loading={shoes.deleting}
        />
        <ActionButton
          icon="heart"
          label={shoes.isWearingCurrent ? "Wearing today" : "Wear these today"}
          onPress={onWear}
          loading={shoes.saving}
          active={shoes.isWearingCurrent}
        />
      </ActionRow>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    gap: spacing.md,
  },
  image: {
    flex: 1,
    width: "100%",
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  message: {
    fontSize: fontSizes.small,
    color: colors.secondary,
    textAlign: "center",
  },
});
