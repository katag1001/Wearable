// The seven days in a row, each showing its tag's icon (or "+"). Tapping
// a day makes it the active one. Used wherever weekly tags are picked.

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { weekDays } from "@core/constants/weekDays.js";
import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";
import { getTagOption } from "@core/utils/tagOptions.js";

export const WeekDayRow = ({ weeklyTags, activeDay, onDayPress }) => (
  <View style={styles.row}>
    {weekDays.map((day) => {
      const tag = getTagOption(weeklyTags[day.key]);
      const isActive = day.key === activeDay;

      return (
        <Pressable
          key={day.key}
          onPress={() => onDayPress(day.key)}
          accessibilityRole="button"
          accessibilityLabel={`${day.label}: ${tag ? tag.name : "none"}`}
          accessibilityState={{ selected: isActive }}
          style={[styles.day, isActive && styles.activeDay]}
        >
          <Text style={[styles.dayName, isActive && styles.activeText]}>
            {day.label.slice(0, 3)}
          </Text>

          {tag ? (
            <Image source={tag.image} style={styles.icon} resizeMode="contain" />
          ) : (
            <Text style={[styles.empty, isActive && styles.activeText]}>+</Text>
          )}
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  day: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  activeDay: {
    borderColor: colors.main,
    backgroundColor: colors.main,
  },
  dayName: {
    fontSize: fontSizes.tag,
    fontWeight: fontWeights.medium,
    color: colors.secondary,
  },
  activeText: {
    color: colors.inverse,
  },
  icon: {
    width: 28,
    height: 28,
  },
  empty: {
    height: 28,
    lineHeight: 28,
    fontSize: fontSizes.sectionTitle,
    color: colors.muted,
  },
});
