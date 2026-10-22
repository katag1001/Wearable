// Change shoes: the whole Today page while open, with the outfit's shoes
// one at a time, best first, swiped like the outfits (next lowers the
// pairing of the shoe being left). Shown in place of the page, not in a
// Modal or over it: swiping didn't work inside a Modal. `onChoose(shoe)`
// may return a promise (saving the worn outfit's shoes); it closes unless
// that resolves false. `wearing`: choosing wears them (the worn outfit's
// shoes), so it's the heart, as when wearing an outfit; otherwise a
// `chooseLabel` button.
// Logic: useShoeChooser (shared with the web's popup).

import { useEffect, useRef, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useShoeChooser } from "@core/hooks/useShoeChooser.js";
import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { Button, Loading } from "../ui";
import { ActionButton, ActionRow } from "./ActionButton";
import { SwipeDeck } from "./SwipeDeck";

const shoePhoto = (shoe) =>
  shoe?.imageUrl ? getImageUrl(shoe.imageUrl, 800) : null;

export const ShoeChooser = ({
  footwear,
  outfit,
  startShoe,
  chooseLabel,
  wearing = false,
  onChoose,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { shoes, current, index, goNext, goPrev } = useShoeChooser({
    footwear,
    outfit,
    startShoe,
  });

  // The shoes either side, loaded ahead so a swipe lands on a ready photo.
  useEffect(() => {
    const count = shoes.length;

    if (count <= 1) return;

    const neighbours = [shoes[(index + 1) % count], shoes[(index - 1 + count) % count]]
      .map(shoePhoto)
      .filter(Boolean);

    Image.prefetch(neighbours).catch(() => {});
    // Once per shoe shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, shoes.length]);

  const [saving, setSaving] = useState(false);

  const close = () => {
    if (!saving) onClose();
  };

  // Android's back button closes the panel, as it would a Modal.
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      closeRef.current();
      return true;
    });

    return () => subscription.remove();
  }, []);

  const choose = async () => {
    setSaving(true);
    const done = await onChoose(current);
    setSaving(false);

    if (done !== false) onClose();
  };

  return (
    <View
      style={[
        styles.page,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Change shoes</Text>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
        >
          <Feather name="x" size={24} color={colors.main} />
        </Pressable>
      </View>

      {current ? (
        <SwipeDeck
          enabled={shoes.length > 1}
          onNext={goNext}
          onPrev={goPrev}
          noun="shoes"
          fill
        >
          {/* Not touchable, so drags land on the card and swipe it. */}
          <View style={styles.photo}>
            {/* recyclingKey blanks it on a new shoe, so the old one
                never shows on the incoming card. */}
            <Image
              source={shoePhoto(current)}
              recyclingKey={current._id}
              style={styles.image}
              contentFit="contain"
              transition={150}
              accessibilityLabel={current.name}
            />
          </View>
        </SwipeDeck>
      ) : (
        <Loading text="Loading footwear..." />
      )}

      {wearing ? (
        <ActionRow>
          <ActionButton
            icon="heart"
            label={chooseLabel}
            onPress={current ? choose : undefined}
            loading={saving}
          />
        </ActionRow>
      ) : (
        <Button
          label={chooseLabel}
          onPress={choose}
          loading={saving}
          disabled={!current}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.pageBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  photo: {
    flex: 1,
    pointerEvents: "none",
  },
  image: {
    flex: 1,
    width: "100%",
    borderRadius: radius.lg,
  },
});
