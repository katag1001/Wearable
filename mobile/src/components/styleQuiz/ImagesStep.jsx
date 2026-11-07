// Style quiz: pick every style image that feels like you. For the genders
// asked pairing questions, a smart-and-casual tile sits at the end - a
// pairing answer, not a style image (useStyleQuiz). A retake can skip it,
// keeping the saved colour and pattern levels.

import { Grid, ImageTile } from "../ui";
import { QuizActions } from "./QuizActions";
import { SubtitleWithSkip } from "./SubtitleWithSkip";

export const ImagesStep = ({ quiz }) => (
  <>
    {quiz.retake ? <SubtitleWithSkip onSkip={quiz.skipImages} /> : null}

    <Grid columns={2}>
      {quiz.imageOptions.map((option) => (
        <ImageTile
          key={option.key}
          source={option.image}
          label={`Style ${option.key}`}
          selected={quiz.selectedImages.includes(option.key)}
          onPress={() => quiz.toggleImage(option.key)}
          aspectRatio={3 / 4}
        />
      ))}
      {quiz.showSmartCasual ? (
        <ImageTile
          source={quiz.smartCasualOption.image}
          label={quiz.smartCasualOption.label}
          placeholder={quiz.smartCasualOption.label}
          selected={quiz.likesSmartCasual}
          onPress={quiz.toggleSmartCasual}
          aspectRatio={3 / 4}
        />
      ) : null}
    </Grid>

    <QuizActions
      onBack={quiz.goBack}
      onNext={quiz.goToNextStep}
      nextDisabled={quiz.selectedImages.length === 0}
    />
  </>
);
