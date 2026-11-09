// The tights and trend notes on Today's outfit, in a soft banner along the
// top of the outfit card: translucent white with a light top edge, one line
// per note, each led by a small dot in its hue (noteTints) and closed with
// its own X (`onDismiss(key)`). Fades in with the outfit sliding in - the
// picker keys it by outfit, so each outfit's banner starts afresh.
//
// notes: [{ key, kind: "tights" | "trend", text }]

import Feather from "@expo/vector-icons/Feather";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { houseBox, ink, motion, noteTints, space, type } from "../../theme/soft";

const DOT = 7;

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
        <View key={note.key} style={styles.row} accessibilityRole="text">
          <View style={[styles.dot, { backgroundColor: noteTints[note.kind] }]} />
          <Text style={styles.text}>{note.text}</Text>
          <Pressable
            onPress={() => onDismiss(note.key)}
            accessibilityRole="button"
            accessibilityLabel="Hide this note"
            hitSlop={12}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Feather name="x" size={16} color={ink.muted} />
          </Pressable>
        </View>
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
  pressed: {
    opacity: 0.5,
  },
});
