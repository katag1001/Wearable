// Weekly preferences: a tag for each day, used to pick today's outfits.
// Logic: useWeeklyPreferences (shared with the web).

import { tagOptions } from "@core/constants/optionsBank.js";
import { useWeeklyPreferences } from "@core/hooks/useWeeklyPreferences.js";

import {
  Button,
  Chip,
  ChipRow,
  Loading,
  Message,
  Screen,
  SectionTitle,
} from "../../components/ui";
import { WeekDayRow } from "../../components/week/WeekDayRow";

export default function WeeklyPreferencesScreen() {
  const weekly = useWeeklyPreferences();

  if (weekly.loading) {
    return <Loading text="Loading your preferences..." />;
  }

  const selectedTagName = weekly.weeklyTags[weekly.selectedDay];

  return (
    <Screen
      subtitle="Choose what you'd like to wear each day."
      edges={["bottom"]}
    >
      <WeekDayRow
        weeklyTags={weekly.weeklyTags}
        activeDay={weekly.selectedDay}
        onDayPress={weekly.selectDay}
      />

      <SectionTitle
        title={weekly.selectedDayLabel}
        description={selectedTagName || "No preference"}
        right={
          selectedTagName ? (
            <Button label="Clear" variant="text" onPress={weekly.clearDay} />
          ) : null
        }
      />

      <ChipRow>
        {tagOptions.map((tag) => (
          <Chip
            key={tag.name}
            label={tag.name}
            selected={selectedTagName === tag.name}
            onPress={() => weekly.selectTag(tag.name)}
          />
        ))}
      </ChipRow>

      <Message text={weekly.error} />
      <Message text={weekly.success} type="success" />

      <Button
        label="Save preferences"
        onPress={weekly.save}
        loading={weekly.saving}
      />
    </Screen>
  );
}
