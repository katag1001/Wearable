// The tights and trend notes on Today's outfit, in a soft banner along the
// top of the outfit card: the house box, one line per note (soft/NoteRow -
// a dot in its hue, closed with its own X: `onDismiss(key)`). Fades in with
// the outfit sliding in - the picker keys it by outfit, so each outfit's
// banner starts afresh.
//
// notes: [{ key, kind: "tights" | "trend", text }]

import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { houseBox, motion, space } from "../../theme/soft";
import { NoteRow } from "../soft/NoteRow";

export const NoteBanner = ({ notes, onDismiss }) => {
  const shown = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(shown, {
      toValue: 1,
      duration: motion.panel,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();
  }, [shown]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          opacity: shown,
          transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
        },
      ]}
    >
      {notes.map((note) => (
        <NoteRow
          key={note.key}
          kind={note.kind}
          text={note.text}
          onDismiss={() => onDismiss(note.key)}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    // Out past the page gutter, to the same space from the screen's sides
    // as above it (Today's bottom tab's top padding).
    marginHorizontal: -(space.gutter - space.md),
    marginBottom: space.xs,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    gap: space.xs,
    ...houseBox,
  },
});
