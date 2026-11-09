// The item's photo: the newly chosen one, else the saved one, with
// buttons to take a photo or choose one from the library.

import { StyleSheet, View } from "react-native";

import { getImageUrl } from "@core/utils/getImageUrl.js";

import { space } from "../../theme/soft";
import { pickImage } from "../../platform/imagePicker";
import { Button, ImageTile } from "../ui";
import { showDialog } from "../soft/Dialog";

// Takes or chooses a photo ("camera" | "library") and hands it to onPick.
export const choosePhoto = async (source, onPick) => {
  try {
    const image = await pickImage(source);

    if (image) {
      onPick(image);
    }
  } catch (err) {
    showDialog("Photo", err.message);
  }
};

// Asks whether to take a photo or choose one, then does it.
export const askForPhoto = (onPick) =>
  showDialog("Photo", "Change this item's photo?", [
    { text: "Take photo", onPress: () => choosePhoto("camera", onPick) },
    { text: "Choose photo", onPress: () => choosePhoto("library", onPick) },
    { text: "Cancel", style: "cancel" },
  ]);

// The newly chosen photo, else the saved one, as an image source.
export const photoSource = (selectedImage, savedImageUrl) =>
  selectedImage
    ? { uri: selectedImage.uri }
    : savedImageUrl
      ? { uri: getImageUrl(savedImageUrl, 800) }
      : null;

export const PhotoPicker = ({ selectedImage, savedImageUrl, onPick }) => {
  const choose = (source) => choosePhoto(source, onPick);

  const preview = photoSource(selectedImage, savedImageUrl);

  const hasPhoto = !!preview;

  return (
    <View style={styles.picker}>
      <ImageTile
        source={preview}
        placeholder="No photo yet"
        aspectRatio={4 / 5}
        resizeMode="contain"
      />

      <View style={styles.buttons}>
        <Button
          label={hasPhoto ? "Retake" : "Take photo"}
          variant="secondary"
          onPress={() => choose("camera")}
          style={styles.button}
        />
        <Button
          label={hasPhoto ? "Change" : "Choose photo"}
          variant="secondary"
          onPress={() => choose("library")}
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
