// An outfit's 1-5 star rating: filled black stars up to `rating`, outlines
// after (all outlines when null). Tapping a star picks that rating.

import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { RATING_STARS } from "@core/matches/rating.js";
import { colors, spacing } from "@core/theme/tokens.js";

export const StarRating = ({ rating, onChange, size = 26, style }) => (
  <View style={[styles.row, style]} accessibilityRole="radiogroup" accessibilityLabel="Rating">
    {RATING_STARS.map((star) => {
      const filled = rating != null && star <= rating;

      return (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          accessibilityRole="radio"
          accessibilityLabel={`${star} star${star === 1 ? "" : "s"}`}
          accessibilityState={{ checked: rating === star }}
          hitSlop={4}
        >
          <Ionicons
            name={filled ? "star" : "star-outline"}
            size={size}
            color={filled ? colors.main : colors.muted}
          />
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
});
