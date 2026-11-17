// The item's photo: the newly chosen one, else the saved one, with
// buttons to take a photo or choose one from the library.
//
// A newly chosen photo is cut out on the phone first
// (platform/garmentCutout.js; context/phone-cutout-plan.md) and the
// cut-out is used, with "Use original photo" to swap back to the photo as
// taken (swapPhoto). If the phone can't, the photo is used as taken - no
// Cloudinary here. Either way it's only uploaded when the item is saved
// (core/wardrobe/saveWardrobeItem.js).

import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { getImageUrl } from "@core/utils/getImageUrl.js";

import { space } from "../../theme/soft";
import { CUTOUT_STRICT_TEST, cutOutPhoto } from "../../platform/garmentCutout";
import { pickImage } from "../../platform/imagePicker";
import { Button, ImageTile } from "../ui";
import { showDialog } from "../soft/Dialog";

// Takes or chooses a photo ("camera" | "library"), cuts the garment out
// and hands the result to onPick: the cut-out, with the photo as taken as
// its `alternative` - or just the photo as taken if the phone couldn't.
// `onBusy(true/false)` while it's cutting out.
export const choosePhoto = async (source, onPick, onBusy) => {
  try {
    const image = await pickImage(source);

    if (!image) return;

    onBusy?.(true);
    const { image: cutout, failure } = await cutOutPhoto(image);
    onBusy?.(false);

    if (cutout) {
      onPick({ ...cutout, alternative: image });
      return;
    }

    onPick(image);

    if (CUTOUT_STRICT_TEST) {
      showDialog("Cut-out test", `The phone couldn't cut this photo out. ${failure?.reason || ""}`);
    }
  } catch (err) {
    onBusy?.(false);
    showDialog("Photo", err.message);
  }
};

// Asks whether to take a photo or choose one, then does it.
export const askForPhoto = (onPick, onBusy) =>
  showDialog("Photo", "Change this item's photo?", [
    { text: "Take photo", onPress: () => choosePhoto("camera", onPick, onBusy) },
    { text: "Choose photo", onPress: () => choosePhoto("library", onPick, onBusy) },
    { text: "Cancel", style: "cancel" },
  ]);

// The chosen photo swapped for its alternative (cut-out <-> as taken).
export const swapPhoto = (selectedImage) => {
  const { alternative, ...current } = selectedImage;

  return { ...alternative, alternative: current };
};

// "Use original photo" / "Use cut-out" for a newly chosen photo that has
// both, else null.
export const swapPhotoLabel = (selectedImage) =>
  selectedImage?.alternative
    ? selectedImage.cutout
      ? "Use original photo"
      : "Use cut-out"
    : null;

// The newly chosen photo, else the saved one, as an image source.
export const photoSource = (selectedImage, savedImageUrl) =>
  selectedImage
    ? { uri: selectedImage.uri }
    : savedImageUrl
      ? { uri: getImageUrl(savedImageUrl, 800) }
      : null;

export const PhotoPicker = ({ selectedImage, savedImageUrl, onPick }) => {
  const [busy, setBusy] = useState(false);
  const choose = (source) => choosePhoto(source, onPick, setBusy);

  const preview = photoSource(selectedImage, savedImageUrl);
  const swapLabel = swapPhotoLabel(selectedImage);

  const hasPhoto = !!preview;

  return (
    <View style={styles.picker}>
      <ImageTile
        source={preview}
        placeholder="No photo yet"
        aspectRatio={4 / 5}
        resizeMode="contain"
      />

      {swapLabel ? (
        <Button
          label={swapLabel}
          variant="text"
          disabled={busy}
          onPress={() => onPick(swapPhoto(selectedImage))}
        />
      ) : null}

      <View style={styles.buttons}>
        <Button
          label={hasPhoto ? "Retake" : "Take photo"}
          variant="secondary"
          onPress={() => choose("camera")}
          loading={busy}
          style={styles.button}
        />
        <Button
          label={hasPhoto ? "Change" : "Choose photo"}
          variant="secondary"
          onPress={() => choose("library")}
          disabled={busy}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    gap: space.sm,
  },
  buttons: {
    flexDirection: "row",
    gap: space.sm,
  },
  button: {
    flex: 1,
  },
});
