// The favourite heart on outfit cards, wardrobe items and the outfit
// screen: just the icon, no circle - drawn like the rating stars
// (soft/IridescentStars), matching the first star: filled with a blush →
// mint blend when favourited, a soft outline otherwise. Position it with
// `style`.

import { useId } from "react";
import { Pressable } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { ink, ratingRun } from "../../theme/soft";

// Ionicons' filled heart shape.
const HEART =
  "M256 448a32 32 0 01-18-5.57c-78.59-53.35-112.62-89.93-131.39-112.8-40-48.75-59.15-98.8-58.61-153C48.63 114.52 98.46 64 159.08 64c44.08 0 74.61 24.83 92.39 45.51a6 6 0 009.06 0C278.31 88.81 308.84 64 352.92 64c60.62 0 110.45 50.52 111.08 112.64.54 54.21-18.63 104.26-58.61 153-18.77 22.87-52.8 59.45-131.39 112.8a32 32 0 01-18 5.56z";

// The stars' line widths (1.2 filled, 1.4 outline on a 24 box), scaled to
// the heart's 512 box.
const FILLED_STROKE = 26;
const OUTLINE_STROKE = 30;

export const FavouriteHeart = ({ favourite, onPress, size = 20, style }) => {
  const gradient = `heart${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={favourite ? "Remove from favourites" : "Add to favourites"}
      accessibilityState={{ selected: !!favourite }}
      hitSlop={10}
      style={style}
    >
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          <LinearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={ratingRun[0]} />
            <Stop offset="1" stopColor={ratingRun[1]} />
          </LinearGradient>
        </Defs>
        <Path
          d={HEART}
          fill={favourite ? `url(#${gradient})` : "none"}
          stroke={favourite ? `url(#${gradient})` : ink.muted}
          strokeWidth={favourite ? FILLED_STROKE : OUTLINE_STROKE}
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
};
