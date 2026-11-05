// An item's photo, as big as fits its space (kept to its own shape), on
// pearl with rounded corners - like a photo of an outfit. Tap it to change
// it (`onPress`). Reports the photo's shape (`onAspect`, height / width)
// once it's loaded, so the page can make room for it (usePhotoFollowsPanel).

import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, fontWeights, radius, spacing } from "../../theme/tokens";
import { BubbleLoader } from "../soft/BubbleLoader";

// The photo's shape until it's loaded (height / width).
export const DEFAULT_PHOTO_ASPECT = 4 / 3;

// How wide a photo of `aspect` is when fitted into width x height.
export const photoFitWidth = (aspect, width, height) =>
  Math.min(width, height / aspect);

export const ItemPhoto = ({
  source,
  aspect = DEFAULT_PHOTO_ASPECT,
  onAspect,
  onPress,
  label = "Change photo",
}) => {
  const [space, setSpace] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const width = space ? photoFitWidth(aspect, space.width, space.height) : 0;

  return (
    <View
      style={styles.space}
      onLayout={(event) => setSpace(event.nativeEvent.layout)}
    >
      {space ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={({ pressed }) => [
            styles.photo,
            { width, height: width * aspect },
            pressed && styles.pressed,
          ]}
        >
          {source ? (
            <>
              <Image
                source={source}
                style={styles.image}
                contentFit="contain"
                transition={150}
                onLoad={(event) => {
                  setLoaded(true);
                  const { width: w, height: h } = event.source ?? {};
                  if (w && h) onAspect?.(h / w);
                }}
              />
              {!loaded ? (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <BubbleLoader size={28} />
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.placeholder}>No photo yet - tap to add one</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  space: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    borderRadius: radius.lg,
    borderCurve: "continuous",
    backgroundColor: colors.itemBackground,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pressed: {
    opacity: 0.85,
  },
  placeholder: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.small,
    color: colors.muted,
    textAlign: "center",
    padding: spacing.sm,
  },
});
