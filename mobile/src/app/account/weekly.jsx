// Weekly preferences: a tag for each day, used to pick today's outfits.
// Logic: useWeeklyPreferences (shared with the web).

import { tagOptions } from "@core/constants/optionsBank.js";
import { useWeeklyPreferences } from "@core/hooks/useWeeklyPreferences.js";

import {
  Button,
  Grid,
  Loading,
  Message,
  Screen,
  SectionTitle,
  TagTile,
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

      <Grid columns={3}>
        {tagOptions.map((tag) => (
          <TagTile
            key={tag.name}
            tag={tag}
            selected={selectedTagName === tag.name}
            onPress={() => weekly.selectTag(tag.name)}
          />
        ))}
      </Grid>

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
