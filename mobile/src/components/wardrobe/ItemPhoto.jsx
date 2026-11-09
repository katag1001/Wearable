// An item's photo, as big as fits its space (kept to its own shape), on
// pearl with rounded corners - like a photo of an outfit. Tap it to change
// it (`onPress`). Reports the photo's shape (`onAspect`, height / width)
// once it's loaded, so the page can make room for it (usePhotoFollowsPanel).

import { useState } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/tokens";
import { loaderSizes, radii, space, type } from "../../theme/soft";
import { BubbleLoader } from "../soft/BubbleLoader";
import { PressableScale } from "../soft/PressableScale";

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
  const [area, setArea] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const width = area ? photoFitWidth(aspect, area.width, area.height) : 0;

  return (
    <View
      style={styles.space}
      onLayout={(event) => setArea(event.nativeEvent.layout)}
    >
      {area ? (
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[styles.photo, { width, height: width * aspect }]}
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
                  <BubbleLoader size={loaderSizes.small} />
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.placeholder}>No photo yet - tap to add one</Text>
          )}
        </PressableScale>
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
    borderRadius: radii.tile,
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
  placeholder: {
    ...type.caption,
    textAlign: "center",
    padding: space.xs,
  },
});
