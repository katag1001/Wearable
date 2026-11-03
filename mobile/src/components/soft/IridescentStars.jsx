// A 1-5 star rating where the filled stars carry the iridescent run, one
// hue into the next along the row (blush → lavender → sky → mint → peach),
// like a bubble's rim. Empty stars are a soft outline. Tapping a star
// picks that rating. The soft ui/StarRating.

import { useId } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { RATING_STARS } from "@core/matches/rating.js";

import { ink, iridescent, space } from "../../theme/soft";

const STAR =
  "M12 2.8l2.85 5.8 6.4.93-4.63 4.5 1.1 6.37L12 17.4l-5.72 3 1.1-6.37-4.63-4.5 6.4-.93z";

const Star = ({ index, filled, size, id }) => {
  // Each star runs from its hue to the next, so the row reads as one sweep.
  const from = iridescent[index % iridescent.length];
  const to = iridescent[(index + 1) % iridescent.length];
  const gradient = `star${id}${index}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Path
        d={STAR}
        fill={filled ? `url(#${gradient})` : "none"}
        stroke={filled ? `url(#${gradient})` : ink.muted}
        strokeWidth={filled ? 1.2 : 1.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const IridescentStars = ({ rating, onChange, size = 24, style }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Rating"
    >
      {RATING_STARS.map((star, index) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          accessibilityRole="radio"
          accessibilityLabel={`${star} star${star === 1 ? "" : "s"}`}
          accessibilityState={{ checked: rating === star }}
          hitSlop={4}
        >
          <Star
            index={index}
            filled={rating != null && star <= rating}
            size={size}
            id={id}
          />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: space.xs,
  },
});
