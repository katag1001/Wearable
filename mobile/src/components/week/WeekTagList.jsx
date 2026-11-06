// The seven days down the side, each with a box showing its tag. Tapping
// a tag box opens a sheet with every tag, grouped; picking one sets it
// for that day and closes the sheet. The day's tag can be cleared there.
// A switch above the days sets Mon-Fri the same (useSameWeekdays).

import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { tagGroups } from "@core/constants/optionsBank.js";
import { weekDays } from "@core/constants/weekDays.js";
import { useSameWeekdays } from "@core/hooks/useSameWeekdays.js";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "../../theme/tokens";
import { mid } from "../../theme/soft";
import { Button, Chip, ChipRow, Sheet } from "../ui";

export const WeekTagList = ({ weeklyTags, onTagChange }) => {
  const [openDay, setOpenDay] = useState(null);
  const { sameWeekdays, toggleSameWeekdays, setDayTag } = useSameWeekdays(
    weeklyTags,
    onTagChange
  );

  const openDayLabel = weekDays.find((day) => day.key === openDay)?.label;
  const close = () => setOpenDay(null);

  const pick = (tagName) => {
    setDayTag(openDay, tagName);
    close();
  };

  return (
    <View style={styles.list}>
      <View style={styles.sameRow}>
        <Text style={styles.sameLabel}>Set all weekdays the same </Text>
        <Switch
          value={sameWeekdays}
          onValueChange={toggleSameWeekdays}
          trackColor={{ false: colors.imageBackground, true: mid.lavender }}
          thumbColor={colors.inverse}
          ios_backgroundColor={colors.imageBackground}
          accessibilityLabel="Set Monday to Friday the same"
        />
      </View>

      {weekDays.map((day) => {
        const tagName = weeklyTags[day.key];

        return (
          <View key={day.key} style={styles.row}>
            <View style={[styles.box, styles.dayBox]}>
              <Text style={styles.dayName}>{day.label}</Text>
            </View>

            <Pressable
              onPress={() => setOpenDay(day.key)}
              accessibilityRole="button"
              accessibilityLabel={`${day.label}: ${tagName || "no tag"}`}
              style={({ pressed }) => [
                styles.box,
                styles.tagBox,
                tagName && styles.tagBoxSet,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.tagName, !tagName && styles.placeholder]}
                numberOfLines={1}
              >
                {tagName || "Choose a tag"}
              </Text>
              <Feather name="chevron-down" size={18} color={colors.muted} />
            </Pressable>
          </View>
        );
      })}

      <Sheet
        visible={Boolean(openDay)}
        title={openDayLabel}
        onClose={close}
        footer={
          openDay && weeklyTags[openDay] ? (
            <Button
              label="Clear this day"
              variant="text"
              onPress={() => pick(null)}
            />
          ) : null
        }
      >
        {tagGroups.map(({ group, tags }) => (
          <View key={group} style={styles.group}>
            <Text style={styles.groupName}>{group}</Text>
            <ChipRow>
              {tags.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  selected={openDay ? weeklyTags[openDay] === name : false}
                  onPress={() => pick(name)}
                />
              ))}
            </ChipRow>
          </View>
        ))}
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  box: {
    minHeight: 50,
    borderRadius: radius.md,
    borderCurve: "continuous",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBackground,
    boxShadow: `inset 0px 1px 0px ${colors.lightEdge}`,
    justifyContent: "center",
  },
  dayBox: {
    width: 116,
  },
  tagBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  tagBoxSet: {
    backgroundColor: colors.selected,
  },
  pressed: {
    opacity: 0.8,
  },
  dayName: {
    fontFamily: fontWeights.medium,
    fontSize: fontSizes.body,
    color: colors.main,
  },
  tagName: {
    flex: 1,
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    color: colors.main,
  },
  placeholder: {
    color: colors.muted,
  },
  sameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  sameLabel: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    color: colors.main,
  },
  group: {
    gap: spacing.sm,
  },
  groupName: {
    fontFamily: fontWeights.semibold,
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
});
