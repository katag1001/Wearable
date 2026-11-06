import { useState } from "react";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const [MONDAY, ...TUESDAY_TO_FRIDAY] = WEEKDAYS;

/*
 * "Set Mon-Fri the same" for weekly tags. Turning it on copies Monday's tag
 * to Tuesday-Friday (if Monday has one). While it's on, changing Monday
 * changes all five; changing one of Tuesday-Friday overrides just that day
 * and turns it off. Turning it off leaves the days as they are.
 *
 * `setDayTag` replaces onTagChange for every day.
 */
export const useSameWeekdays = (weeklyTags, onTagChange) => {
  const [sameWeekdays, setSameWeekdays] = useState(false);

  const setWeekdays = (tagName) => {
    WEEKDAYS.forEach((day) => onTagChange(day, tagName));
  };

  const toggleSameWeekdays = (on) => {
    setSameWeekdays(on);

    if (on && weeklyTags[MONDAY]) {
      setWeekdays(weeklyTags[MONDAY]);
    }
  };

  const setDayTag = (day, tagName) => {
    if (sameWeekdays && day === MONDAY) {
      setWeekdays(tagName);
      return;
    }

    if (sameWeekdays && TUESDAY_TO_FRIDAY.includes(day)) {
      setSameWeekdays(false);
    }

    onTagChange(day, tagName);
  };

  return { sameWeekdays, toggleSameWeekdays, setDayTag };
};
