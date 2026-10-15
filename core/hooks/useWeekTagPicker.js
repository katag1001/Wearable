import { useState } from "react";

import { weekDays } from "../constants/weekDays.js";

/*
 * Picking a tag for each day of the week, one active day at a time (the
 * style quiz's weekly step).
 *
 * Picking a tag sets it for the active day and moves on to the next day.
 * Picking the day's current tag again clears it.
 */
export const useWeekTagPicker = (weeklyTags, onTagChange) => {
  const [activeDay, setActiveDay] = useState(weekDays[0].key);

  const selectTag = (tagName) => {
    const isCurrent = weeklyTags[activeDay] === tagName;

    onTagChange(activeDay, isCurrent ? null : tagName);

    if (!isCurrent) {
      const index = weekDays.findIndex((day) => day.key === activeDay);
      const nextDay = weekDays[index + 1];

      if (nextDay) {
        setActiveDay(nextDay.key);
      }
    }
  };

  const activeDayLabel =
    weekDays.find((day) => day.key === activeDay)?.label;

  return { activeDay, setActiveDay, activeDayLabel, selectTag };
};
