// Style quiz: pick every style image that feels like you.

import { Grid, ImageTile } from "../ui";
import { QuizActions } from "./QuizActions";

export const ImagesStep = ({ quiz }) => (
  <>
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
    </Grid>

    <QuizActions
      onBack={quiz.goBack}
      onNext={quiz.goToNextStep}
      nextDisabled={quiz.selectedImages.length === 0}
    />
  </>
);
