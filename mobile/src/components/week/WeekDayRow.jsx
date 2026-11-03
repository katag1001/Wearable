// The seven days in a row, each showing its tag's name (or "+"). Tapping
// a day makes it the active one. Used wherever weekly tags are picked.

import { Pressable, StyleSheet, Text, View } from "react-native";

import { weekDays } from "@core/constants/weekDays.js";
import { getTagOption } from "@core/utils/tagOptions.js";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "../../theme/tokens";
import { mid } from "../../theme/soft";

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
            <Text
              style={[styles.tagName, isActive && styles.activeText]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {tag.name}
            </Text>
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
    borderCurve: "continuous",
    backgroundColor: colors.cardBackground,
    boxShadow: `inset 0px 1px 0px ${colors.lightEdge}`,
  },
  activeDay: {
    backgroundColor: `${mid.lavender}80`,
  },
  dayName: {
    fontSize: fontSizes.tag,
    fontFamily: fontWeights.medium,
    color: colors.secondary,
  },
  activeText: {
    fontFamily: fontWeights.semibold,
    color: colors.main,
  },
  tagName: {
    fontFamily: fontWeights.regular,
    height: 28,
    lineHeight: 28,
    paddingHorizontal: 2,
    fontSize: fontSizes.tag,
    color: colors.main,
  },
  empty: {
    fontFamily: fontWeights.regular,
    height: 28,
    lineHeight: 28,
    fontSize: fontSizes.sectionTitle,
    color: colors.muted,
  },
});
