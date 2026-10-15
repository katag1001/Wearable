// The shoes for today's worn outfit, best first. Logic: useTodayFootwear
// (shared with the web's shoe box).

import { Image } from "expo-image";
import { StyleSheet, Text } from "react-native";

import { useTodayFootwear } from "@core/hooks/useTodayFootwear.js";
import { colors, fontSizes, radius } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { Button, Card, Loading, SectionTitle } from "../ui";
import { Stepper } from "./Stepper";

export const ShoeBox = ({ outfit, todayTag }) => {
  const shoes = useTodayFootwear({ outfit, todayTag });
  const { current } = shoes;

  const body = () => {
    if (shoes.error && shoes.loading) {
      return <Text style={styles.message}>{shoes.error}</Text>;
    }

    if (shoes.loading) {
      return <Loading text="Loading footwear..." />;
    }

    if (!shoes.shoes.length) {
      return (
        <Text style={styles.message}>
          Add footwear in your Wardrobe to get shoe suggestions here.
        </Text>
      );
    }

    return (
      <>
        <Image
          source={current.imageUrl ? getImageUrl(current.imageUrl, 600) : null}
          style={styles.image}
          contentFit="contain"
          transition={150}
          accessibilityLabel={current.name}
        />
        <Text style={styles.name}>{current.name}</Text>

        <Stepper
          index={shoes.index}
          total={shoes.shoes.length}
          onPrev={shoes.goPrev}
          onNext={shoes.goNext}
          noun="shoes"
        />

        {shoes.error ? <Text style={styles.message}>{shoes.error}</Text> : null}

        <Button
          label={shoes.isWearingCurrent ? "Wearing today" : "Wear these"}
          variant="secondary"
          onPress={shoes.wearCurrent}
          loading={shoes.saving}
          disabled={shoes.isWearingCurrent}
        />
      </>
    );
  };

  return (
    <Card>
      <SectionTitle title="Shoes" />
      {body()}
    </Card>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  name: {
    fontSize: fontSizes.body,
    color: colors.main,
    textAlign: "center",
  },
  message: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
});
