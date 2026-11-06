// Style preferences: change the style quiz answers.
// Logic: useStylePreferences (shared with the web).

import { StyleSheet, Text, View } from "react-native";

import {
  pairingAnswerOptions,
  pairingQuestions,
} from "@core/constants/pairingQuestions.js";
import {
  genderQuestionOptions,
  seasonalityQuestion,
  temperatureQuestion,
  trendsQuestion,
} from "@core/constants/styleQuizOptions.js";
import { useStylePreferences } from "@core/hooks/useStylePreferences.js";
import { colors, fontSizes, spacing } from "../../../../theme/tokens";

import {
  Button,
  ChoiceCard,
  Grid,
  ImageTile,
  Loading,
  Message,
  Screen,
  SectionTitle,
} from "../../../../components/ui";
import { PalettePicker } from "../../../../components/styleQuiz/PalettePicker";
import { PointScale } from "../../../../components/styleQuiz/PointScale";

export default function StylePreferencesScreen() {
  const style = useStylePreferences();

  if (style.loading) {
    return <Loading text="Loading your preferences..." />;
  }

  return (
    <Screen
      subtitle="Update how you dress and the styles you like."
      edges={["bottom"]}
    >
      <SectionTitle title="How do you prefer to dress?" />
      {genderQuestionOptions.map((option) => (
        <ChoiceCard
          key={option.value}
          label={option.label}
          selected={style.gender === option.value}
          onPress={() => style.chooseGender(option.value)}
        />
      ))}

      <SectionTitle title={temperatureQuestion.title} />
      <PointScale
        question={temperatureQuestion}
        smooth
        value={style.temperature}
        onChange={style.chooseTemperature}
      />

      <SectionTitle
        title={seasonalityQuestion.title}
        description={seasonalityQuestion.hint}
      />
      <PointScale
        question={seasonalityQuestion}
        smooth
        value={style.seasonality}
        onChange={style.chooseSeasonality}
      />

      <SectionTitle title={trendsQuestion.title} />
      <PointScale
        question={trendsQuestion}
        smooth
        value={style.trends}
        onChange={style.chooseTrends}
      />

      <SectionTitle
        title="Select all that apply"
        description="Pick every image that feels like you to update your colour and pattern preferences."
      />
      <Grid columns={2}>
        {style.imageOptions.map((option) => (
          <ImageTile
            key={option.key}
            source={option.image}
            label={`Style ${option.key}`}
            selected={style.selectedImages.includes(option.key)}
            onPress={() => style.toggleImage(option.key)}
            aspectRatio={3 / 4}
          />
        ))}
      </Grid>

      <SectionTitle
        title="Colours you love"
        description="Outfits in these palettes are suggested first. Others are still suggested, just lower down."
      />
      <PalettePicker
        palettes={style.paletteOptions}
        selected={style.favouritePalettes}
        onToggle={style.togglePalette}
      />

      {style.showPairingQuestions && (
        <View style={styles.pairingSection}>
          <SectionTitle
            title="Do you like..."
            description="Leave a question unanswered to keep how those pairings score now."
          />

          {pairingQuestions.map(({ key, label }) => (
            <View key={key} style={styles.question}>
              <Text style={styles.questionText}>{label}</Text>

              <View style={styles.answers}>
                {pairingAnswerOptions.map((option) => {
                  const selected = style.pairingAnswers[key] === option.value;

                  return (
                    <View key={option.value} style={styles.answer}>
                      <ChoiceCard
                        label={option.label}
                        selected={selected}
                        onPress={() =>
                          style.answerPairing(key, selected ? null : option.value)
                        }
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      <Message text={style.error} />
      <Message text={style.success} type="success" />

      <Button
        label="Save preferences"
        onPress={style.save}
        loading={style.saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pairingSection: {
    gap: spacing.md,
  },
  question: {
    gap: spacing.sm,
  },
  questionText: {
    fontSize: fontSizes.body,
    color: colors.main,
  },
  answers: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  answer: {
    flex: 1,
  },
});
