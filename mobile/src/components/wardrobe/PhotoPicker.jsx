// The item's photo: the newly chosen one, else the saved one, with
// buttons to take a photo or choose one from the library.

import { Alert, StyleSheet, View } from "react-native";

import { spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { pickImage } from "../../platform/imagePicker";
import { Button, ImageTile } from "../ui";

export const PhotoPicker = ({ selectedImage, savedImageUrl, onPick }) => {
  const choose = async (source) => {
    try {
      const image = await pickImage(source);

      if (image) {
        onPick(image);
      }
    } catch (err) {
      Alert.alert("Photo", err.message);
    }
  };

  const preview = selectedImage
    ? { uri: selectedImage.uri }
    : savedImageUrl
      ? { uri: getImageUrl(savedImageUrl, 800) }
      : null;

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
    gap: spacing.md,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
