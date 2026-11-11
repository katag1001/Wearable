// The Plan tab's month: the month's name between plain arrows, the
// weekday letters, then the days in weeks (Monday first). Today has a
// ring; a planned day a dot under its number; days that can't be planned
// (past, or too far ahead) are faded and can't be tapped. `calendar` is
// usePlanCalendar; `onPickDay(date)` opens the day.

import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";

import { WEEKDAY_LETTERS } from "@core/plan/calendar.js";

import { calendarTints, iconSizes, ink, radii, space, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";

const DAY_SIZE = 46;

const MonthArrow = ({ icon, label, enabled, onPress }) => (
  <PressableScale
    onPress={onPress}
    disabled={!enabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={8}
    style={!enabled && styles.faded}
  >
    <Feather name={icon} size={iconSizes.regular} color={ink.soft} />
  </PressableScale>
);

const Day = ({ cell, onPress }) => {
  if (!cell.inMonth) return <View style={styles.cell} />;

  const label = `${cell.day}${cell.planned ? ", planned" : ""}`;

  return (
    <View style={styles.cell}>
      <PressableScale
        onPress={onPress}
        disabled={!cell.selectable}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !cell.selectable }}
        style={[
          styles.day,
          cell.isToday && styles.today,
          !cell.selectable && styles.faded,
        ]}
      >
        <Text style={styles.dayNumber}>{cell.day}</Text>
        <View style={[styles.dot, cell.planned && styles.plannedDot]} />
      </PressableScale>
    </View>
  );
};

export const MonthCalendar = ({ calendar, onPickDay }) => (
  <View style={styles.calendar}>
    <View style={styles.header}>
      <MonthArrow
        icon="chevron-left"
        label="Previous month"
        enabled={calendar.canGoBack}
        onPress={calendar.goBack}
      />
      <Text style={styles.title}>{calendar.title}</Text>
      <MonthArrow
        icon="chevron-right"
        label="Next month"
        enabled={calendar.canGoForward}
        onPress={calendar.goForward}
      />
    </View>

    <View style={styles.week}>
      {WEEKDAY_LETTERS.map((letter, index) => (
        <View key={index} style={styles.cell}>
          <Text style={styles.weekday}>{letter}</Text>
        </View>
      ))}
    </View>

    {calendar.weeks.map((week) => (
      <View key={week[0].date} style={[styles.week, styles.dayRow]}>
        {week.map((cell) => (
          <Day key={cell.date} cell={cell} onPress={() => onPickDay(cell.date)} />
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  // Fills the height it's given: the weeks share it evenly, so the month
  // runs down to whatever sits under it (Plan tab: Coming up).
  calendar: {
    flex: 1,
    gap: space.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: space.xs,
  },
  title: type.cardTitle,
  week: {
    flexDirection: "row",
  },
  dayRow: {
    flex: 1,
    alignItems: "center",
  },
  cell: {
    flex: 1,
    alignItems: "center",
  },
  weekday: type.todaySubline,
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: calendarTints.day,
  },
  today: {
    borderWidth: 1.5,
    borderColor: calendarTints.todayRing,
  },
  faded: {
    opacity: 0.35,
  },
  dayNumber: type.calendarDay,
  // Always there (empty when not planned), so every number sits level.
  dot: {
    width: 5,
    height: 5,
    marginTop: 1,
    borderRadius: radii.pill,
  },
  plannedDot: {
    backgroundColor: calendarTints.plannedDot,
  },
});
