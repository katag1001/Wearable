// An outfit's clothes as large photos, laid out the way they're worn:
// outerwear then tops on the upper row, one-pieces and bottoms centred
// underneath (outfitRows). Each photo is half the width, so a row holds two
// and a fuller one wraps; a lone item is full width. `match` is a
// populated match. `fit`: fill the height it's given and shrink the photos
// so the whole outfit fits inside it. `footwear`: a shoe shown on the
// bottoms row (withShoes), the same size as the clothes. `imageStyle`
// adds to each photo's style (e.g. its background). `width`: lay out to
// this width straight away instead of measuring (the outfit cards, whose
// height is worked out before they draw - outfitImagesHeight).
// `imageSize`: the Cloudinary copy's size. `onItemPress(item)` makes each
// item tappable, with `itemLabel(item)` as its accessibility label.
// `showLoading`: a small breathing bubble on each photo until it loads.
//
// The photos get exact pixel sizes from the measured row width: a
// percentage width + aspectRatio inside a wrapping row in a scroll view
// can lay out with no height, so nothing shows.

import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { outfitRows } from "@core/today/outfitRows.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { colors, radius, spacing } from "../../theme/tokens";
import { BubbleLoader } from "../soft/BubbleLoader";

const PHOTO_ASPECT = 4 / 3; // height / width
const PHOTO_SCALE = 0.95;

const UPPER_TYPES = ["top", "outer"];

// One photo, with the bubble over it while it loads (`showLoading`).
const Photo = ({ uri, style, label, showLoading }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View>
      <Image
        source={{ uri }}
        style={style}
        contentFit="contain"
        transition={150}
        accessibilityLabel={label}
        onLoad={() => setLoaded(true)}
      />
      {showLoading && !loaded ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <BubbleLoader size={28} />
        </View>
      ) : null}
    </View>
  );
};

// The shoe joins the lower row (bottoms / one-pieces): on the left when
// it fits beside them, otherwise last, so it wraps onto the bottom line.
// On a row of its own when the outfit has no lower row.
const withShoes = (rows, clothes, shoes, columns) => {
  if (shoes.length === 0) return rows;

  const hasLowerRow = clothes.some((item) => !UPPER_TYPES.includes(item.type));

  if (!hasLowerRow) return [...rows, shoes];

  const lower = rows[rows.length - 1];
  const lowerWithShoes =
    lower.length + shoes.length <= columns ? [...shoes, ...lower] : [...lower, ...shoes];

  return [...rows.slice(0, -1), lowerWithShoes];
};

// Rows, photo size and total height for an outfit laid out `width` wide
// (and, with `fit`, no taller than `height`).
const layOut = ({ match, footwear, width, height, fit }) => {
  const clothes = (match?.clothes || []).filter((item) => item?.imageUrl);
  const shoes = footwear?.imageUrl ? [footwear] : [];
  const columns = clothes.length + shoes.length === 1 ? 1 : 2;
  const rows = withShoes(outfitRows(clothes), clothes, shoes, columns);

  // Rounded down and a touch under the full share, so two always fit side
  // by side - an exact fit can wrap from sub-pixel rounding.
  const widthFit = ((width - spacing.sm * (columns - 1)) / columns) * PHOTO_SCALE;

  // In fit mode, also no taller than the space: every line of photos
  // (a row of three or more wraps) and the gaps between them.
  const lines = rows.reduce((sum, row) => sum + Math.ceil(row.length / columns), 0);
  const heightFit =
    fit && lines > 0
      ? (height - spacing.sm * (lines - 1)) / lines / PHOTO_ASPECT
      : Infinity;

  const photoWidth = Math.max(0, Math.floor(Math.min(widthFit, heightFit)));
  const contentHeight =
    lines > 0 ? lines * photoWidth * PHOTO_ASPECT + spacing.sm * (lines - 1) : 0;

  return { rows, photoWidth, contentHeight };
};

// The photo width for an outfit fitted into width x height (fit mode).
export const outfitImagesFitWidth = (match, width, height) =>
  layOut({ match, width, height, fit: true }).photoWidth;

// How tall an outfit's photos are at `width` (not fit mode).
export const outfitImagesHeight = (match, width, footwear) =>
  layOut({ match, footwear, width }).contentHeight;

export const OutfitImages = ({
  match,
  footwear,
  fit = false,
  imageStyle,
  width: fixedWidth,
  imageSize = 800,
  onItemPress,
  itemLabel = (item) => item.name,
  showLoading = false,
}) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const { rows, photoWidth } = layOut({
    match,
    footwear,
    width: fixedWidth ?? size.width,
    height: size.height,
    fit,
  });

  return (
    <View
      style={[
        styles.outfit,
        fit && styles.fit,
        fixedWidth != null && { width: fixedWidth },
      ]}
      onLayout={
        fixedWidth != null
          ? undefined
          : (event) => {
              const { width, height } = event.nativeEvent.layout;
              setSize({ width, height });
            }
      }
    >
      {photoWidth > 0 &&
        rows.map((row) => (
          <View key={row[0]._id} style={styles.row}>
            {row.map((item) => {
              const photo = (
                <Photo
                  key={item._id}
                  uri={getImageUrl(item.imageUrl, imageSize)}
                  style={[
                    styles.image,
                    imageStyle,
                    { width: photoWidth, height: photoWidth * PHOTO_ASPECT },
                  ]}
                  label={item.name}
                  showLoading={showLoading}
                />
              );

              return onItemPress ? (
                <Pressable
                  key={item._id}
                  onPress={() => onItemPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={itemLabel(item)}
                >
                  {photo}
                </Pressable>
              ) : (
                photo
              );
            })}
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  outfit: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  fit: {
    flex: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  image: {
    borderRadius: radius.lg,
    backgroundColor: colors.itemBackground,
  },
});
