// Under a new item's photo, when adding from a photo
// (context/phone-cutout-plan.md): "Use original photo" / "Use cut-out",
// swapping between the background-removed photo and the photo as taken
// (usePhotoAnalysis' `photoChoice`; nothing is analysed again).

import { Button, Message } from "../ui";

export const PhotoChoice = ({ choice, disabled = false }) => (
  <>
    {choice ? (
      <Button
        label={choice.usingOriginal ? "Use cut-out" : "Use original photo"}
        variant="text"
        loading={choice.swapping}
        disabled={disabled}
        onPress={choice.usingOriginal ? choice.chooseCutout : choice.chooseOriginal}
      />
    ) : null}
    <Message text={choice?.error} />
  </>
);
