// One line of a note: a small dot in the hue for its job (noteTints), the
// line itself and, with `onDismiss`, a small cross to hide it. Today's
// note banner stacks several in one house box (today/NoteBanner); SoftNote
// is a house box holding one. An error's line is in rose-clay.

import { StyleSheet, Text, View } from "react-native";

import { noteTints, semantic, space, type } from "../../theme/soft";
import { IconButton } from "./IconButton";

const DOT = 7;

export const NoteRow = ({ kind, text, onDismiss, dismissLabel = "Hide this note" }) => (
  <View style={styles.row} accessibilityRole="text">
    <View style={[styles.dot, { backgroundColor: noteTints[kind] }]} />
    <Text style={[styles.text, kind === "error" && styles.error]}>{text}</Text>
    {onDismiss ? (
      <IconButton icon="x" label={dismissLabel} size="small" tone="quiet" onPress={onDismiss} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  text: {
    ...type.note,
    flex: 1,
  },
  error: {
    color: semantic.error,
  },
});
