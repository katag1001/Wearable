// Under a new item's photo, when adding from a photo
// (context/phone-cutout-plan.md):
// - PhotoChoice: "Use original photo" / "Use cut-out", swapping between
//   the background-removed photo and the photo as taken (usePhotoAnalysis'
//   `photoChoice`; nothing is analysed again).
// - CutoutTestNote: why the phone couldn't cut the photo out - only in the
//   strict test build (platform/garmentCutout.js, CUTOUT_STRICT_TEST);
//   nothing in any other build.

import { CUTOUT_STRICT_TEST } from "../../platform/garmentCutout";
import { Button, Message } from "../ui";

export const CutoutTestNote = ({ failure }) =>
  CUTOUT_STRICT_TEST && failure ? (
    <Message
      type="info"
      text={`Test build: the phone couldn't cut this photo out. ${failure.reason}`}
    />
  ) : null;

export const PhotoChoice = ({ choice, failure, disabled = false }) => (
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
    <CutoutTestNote failure={failure} />
  </>
);
