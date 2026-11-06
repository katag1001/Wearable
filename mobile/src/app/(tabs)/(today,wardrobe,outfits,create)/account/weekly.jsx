// Weekly preferences: a tag for each day, used to pick today's outfits.
// The same day list as the style quiz (WeekTagList). Logic:
// useWeeklyPreferences (shared with the web).

import { useWeeklyPreferences } from "@core/hooks/useWeeklyPreferences.js";

import { Button, Loading, Message, Screen } from "../../../../components/ui";
import { WeekTagList } from "../../../../components/week/WeekTagList";

export default function WeeklyPreferencesScreen() {
  const weekly = useWeeklyPreferences();

  if (weekly.loading) {
    return <Loading text="Loading your preferences..." />;
  }

  return (
    <Screen
      subtitle="Choose what you'd like to wear each day."
      edges={["bottom"]}
    >
      <WeekTagList weeklyTags={weekly.weeklyTags} onTagChange={weekly.setDayTag} />

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
