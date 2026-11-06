// Style quiz: "Do you like to layer tops?" - tick any that apply, or skip
// (useStyleQuiz.finishLayering / skipLayering). The pictures sit in a
// 2-column grid; Skip is right under the question.

import { Grid, ImageTile } from "../ui";
import { QuizActions } from "./QuizActions";
import { SkipLink } from "./SkipLink";

export const PairingStep = ({ quiz }) => (
  <>
    <SkipLink onPress={quiz.skipLayering} />

    <Grid columns={2}>
      {quiz.layeringOptions.map((option) => (
        <ImageTile
          key={option.key}
          source={option.image}
          label={option.label}
          placeholder="Image coming soon"
          selected={quiz.layeredTops.includes(option.key)}
          onPress={() => quiz.toggleLayering(option.key)}
          aspectRatio={3 / 4}
        />
      ))}
    </Grid>

    <QuizActions onBack={quiz.goBack} onNext={quiz.finishLayering} />
  </>
);
