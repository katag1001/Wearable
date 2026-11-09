// A one-line note, as the house box with a dot like Today's note banner:
// "error" (a rose-clay dot and line), "success" (a mint dot - something
// done) or "info" (the app's lavender dot - news, e.g. "Updating your
// outfits…"). Renders nothing without text.

import { StyleSheet, View } from "react-native";

import { houseBox, space } from "../../theme/soft";
import { NoteRow } from "./NoteRow";

export const SoftNote = ({ text, type: kind = "error" }) => {
  if (!text) return null;

  return (
    <View style={styles.note} accessibilityLiveRegion="polite">
      <NoteRow kind={kind} text={text} />
    </View>
  );
};

const styles = StyleSheet.create({
  note: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    ...houseBox,
  },
});
