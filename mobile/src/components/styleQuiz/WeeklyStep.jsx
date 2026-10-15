// Style quiz: a tag for each day of the week (all optional). Picking a
// tag moves on to the next day (useWeekTagPicker).

import { StyleSheet, Text } from "react-native";

import { tagOptions } from "@core/constants/optionsBank.js";
import { useWeekTagPicker } from "@core/hooks/useWeekTagPicker.js";
import { colors, fontSizes, fontWeights } from "@core/theme/tokens.js";

import { Grid, TagTile } from "../ui";
import { WeekDayRow } from "../week/WeekDayRow";
import { QuizActions } from "./QuizActions";

export const WeeklyStep = ({ quiz }) => {
  const { activeDay, setActiveDay, activeDayLabel, selectTag } =
    useWeekTagPicker(quiz.weeklyTags, quiz.setWeeklyTag);

  return (
    <>
      <WeekDayRow
        weeklyTags={quiz.weeklyTags}
        activeDay={activeDay}
        onDayPress={setActiveDay}
      />

      <Text style={styles.activeDay}>{activeDayLabel}</Text>

      <Grid columns={3}>
        {tagOptions.map((tag) => (
          <TagTile
            key={tag.name}
            tag={tag}
            selected={quiz.weeklyTags[activeDay] === tag.name}
            onPress={() => selectTag(tag.name)}
          />
        ))}
      </Grid>

      <QuizActions onBack={quiz.goBack} onNext={quiz.goToNextStep} />
    </>
  );
};

const styles = StyleSheet.create({
  activeDay: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
});
