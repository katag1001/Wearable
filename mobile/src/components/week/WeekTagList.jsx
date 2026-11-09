// The seven days down the side, each with a box showing its tag - house
// boxes with light names, like Profile's menu boxes; a day with no tag
// shows "Choose a tag" muted. Tapping
// a tag box opens a sheet with every tag, grouped; picking one sets it
// for that day and closes the sheet. The day's tag can be cleared there.
// A switch above the days sets Mon-Fri the same (useSameWeekdays).

import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { tagGroups } from "@core/constants/optionsBank.js";
import { weekDays } from "@core/constants/weekDays.js";
import { useSameWeekdays } from "@core/hooks/useSameWeekdays.js";

import { colors } from "../../theme/tokens";
import { accent, houseBox, iconSizes, space, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";
import { Button, Chip, ChipRow, SectionTitle, Sheet } from "../ui";

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
          trackColor={{ false: colors.imageBackground, true: accent.mid }}
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

            <PressableScale
              onPress={() => setOpenDay(day.key)}
              accessibilityRole="button"
              accessibilityLabel={`${day.label}: ${tagName || "no tag"}`}
              style={[styles.box, styles.tagBox]}
            >
              <Text
                style={[styles.tagName, !tagName && styles.placeholder]}
                numberOfLines={1}
              >
                {tagName || "Choose a tag"}
              </Text>
              <Feather name="chevron-down" size={iconSizes.small} color={colors.muted} />
            </PressableScale>
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
            <SectionTitle description={group} />
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
    gap: space.xs,
  },
  row: {
    flexDirection: "row",
    gap: space.xs,
  },
  box: {
    minHeight: 50,
    paddingHorizontal: space.sm,
    justifyContent: "center",
    ...houseBox,
  },
  dayBox: {
    width: 116,
  },
  tagBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.xs,
  },
  dayName: type.menuLabel,
  tagName: {
    ...type.menuLabel,
    flex: 1,
  },
  placeholder: {
    color: colors.muted,
  },
  sameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xxs,
  },
  sameLabel: type.menuLabel,
  group: {
    gap: space.xs,
  },
});
