// Style quiz: a tag for each day of the week (all optional) - the days
// down the side, each with a tag box that opens the tag list. Skip moves
// on without saving any days.

import { weeklyQuestion } from "@core/constants/styleQuizOptions.js";

import { WeekTagList } from "../week/WeekTagList";
import { QuizActions } from "./QuizActions";
import { SubtitleWithSkip } from "./SubtitleWithSkip";

export const WeeklyStep = ({ quiz }) => (
  <>
    <SubtitleWithSkip text={weeklyQuestion.subtitle} onSkip={quiz.skipWeekly} />

    <WeekTagList weeklyTags={quiz.weeklyTags} onTagChange={quiz.setWeeklyTag} />

    <QuizActions onBack={quiz.goBack} onNext={quiz.goToNextStep} />
  </>
);
