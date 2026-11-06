// Weekly preferences: a tag for each day, used to pick today's outfits.
// Laid out like the style quiz's weekly step (WeeklyStep) - same heading
// and day list (WeekTagList) - with Save in place of Back / Next. Logic:
// useWeeklyPreferences (shared with the web).

import { weeklyQuestion } from "@core/constants/styleQuizOptions.js";
import { useWeeklyPreferences } from "@core/hooks/useWeeklyPreferences.js";

import { Loading, Message, Screen } from "../../../../components/ui";
import { QuizActions } from "../../../../components/styleQuiz/QuizActions";
import { WeekTagList } from "../../../../components/week/WeekTagList";

export default function WeeklyPreferencesScreen() {
  const weekly = useWeeklyPreferences();

  if (weekly.loading) {
    return <Loading text="Loading your preferences..." />;
  }

  return (
    <Screen
      title={weeklyQuestion.title}
      subtitle={weeklyQuestion.subtitle}
      edges={["bottom"]}
    >
      <WeekTagList weeklyTags={weekly.weeklyTags} onTagChange={weekly.setDayTag} />

      <Message text={weekly.error} />
      <Message text={weekly.success} type="success" />

      <QuizActions
        onNext={weekly.save}
        nextLabel="Save"
        loading={weekly.saving}
      />
    </Screen>
  );
}
