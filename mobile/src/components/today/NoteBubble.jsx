// A note on Today's outfit (tights, trends) in a soap bubble floating over
// the photos: translucent, so the outfit shows through, faded in with the
// outfit sliding in, and dragged
// anywhere with a finger. It stays where it's let go, kept inside `bounds`
// (the picker's size), and otherwise keeps still. Let go over the X
// (DismissTarget, shown by the picker while `onDragChange` says a drag is
// on) it pops and `onDismiss` is called. It sits beside the swipe deck,
// not in it, so dragging it never moves the outfit. Built on PanResponder
// + Animated, like SwipeDeck.
//
// onDragChange({ dragging, overX }) - on each change while dragging, and
// with dragging false when it's let go.

import { useEffect, useRef } from "react";
import { Animated, Easing, PanResponder, StyleSheet, Text, View } from "react-native";

import { surface, type } from "../../theme/soft";
import { Bubble } from "../soft/Bubble";
import { DISMISS_REACH, dismissCentre } from "./DismissTarget";

export const NOTE_BUBBLE_SIZE = 118;

// Bubble.jsx draws its body at r=46 of 100.
const BODY = NOTE_BUBBLE_SIZE * 0.92;

const POP_MS = 180;
// About as long as the outfit takes to slide in (SwipeDeck).
const FADE_IN_MS = 300;

const clamp = (value, max) => Math.min(Math.max(value, 0), Math.max(max, 0));

// Whether the bubble's middle, at `spot`, is on the X.
const isOverX = (spot, bounds) => {
  const centre = dismissCentre(bounds);
  const x = spot.x + NOTE_BUBBLE_SIZE / 2 - centre.x;
  const y = spot.y + NOTE_BUBBLE_SIZE / 2 - centre.y;

  return Math.hypot(x, y) <= DISMISS_REACH;
};

export const NoteBubble = ({ text, start, bounds, variant = 0, onDragChange, onDismiss }) => {
  const position = useRef(new Animated.ValueXY(start)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const shown = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(shown, {
      toValue: 1,
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [shown]);

  // Where it was let go, where the finger has it now, and whether that's
  // on the X.
  const at = useRef(start);
  const now = useRef(start);
  const overX = useRef(false);
  const latest = useRef({});
  latest.current = { bounds, onDragChange, onDismiss };

  const letGo = () => {
    latest.current.onDragChange?.({ dragging: false, overX: false });

    if (!overX.current) {
      at.current = now.current;
      return;
    }

    Animated.timing(pop, {
      toValue: 1,
      duration: POP_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => latest.current.onDismiss?.());
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Kept from the pull-up panel and anything else that wants the drag.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        overX.current = false;
        latest.current.onDragChange?.({ dragging: true, overX: false });
      },
      onPanResponderMove: (_, { dx, dy }) => {
        const { bounds: { width, height } } = latest.current;

        now.current = {
          x: clamp(at.current.x + dx, width - NOTE_BUBBLE_SIZE),
          y: clamp(at.current.y + dy, height - NOTE_BUBBLE_SIZE),
        };
        position.setValue(now.current);

        const over = isOverX(now.current, latest.current.bounds);

        if (over !== overX.current) {
          overX.current = over;
          latest.current.onDragChange?.({ dragging: true, overX: over });
        }
      },
      onPanResponderRelease: letGo,
      onPanResponderTerminate: letGo,
    })
  ).current;

  return (
    <Animated.View
      {...pan.panHandlers}
      accessibilityRole="text"
      accessibilityLabel={text}
      style={[styles.bubble, { transform: position.getTranslateTransform() }]}
    >
      {/* Swells a little and fades as it pops. */}
      <Animated.View
        style={[
          styles.fill,
          {
            opacity: Animated.multiply(
              shown,
              pop.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
            ),
            transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
          },
        ]}
      >
        <View style={styles.veil} />
        <Bubble size={NOTE_BUBBLE_SIZE} variant={variant} part="body" style={StyleSheet.absoluteFill} />
        <Text style={styles.text} numberOfLines={5} adjustsFontSizeToFit minimumFontScale={0.75}>
          {text}
        </Text>
        {/* The highlights over the words, so they always show. */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Bubble size={NOTE_BUBBLE_SIZE} variant={variant} part="shine" />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    left: 0,
    top: 0,
    width: NOTE_BUBBLE_SIZE,
    height: NOTE_BUBBLE_SIZE,
  },
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // A soft white body, so it reads as a bubble and the words read over
  // the photos.
  veil: {
    position: "absolute",
    width: BODY,
    height: BODY,
    borderRadius: BODY / 2,
    backgroundColor: surface.veil,
  },
  // Inside the square that fits in the circle.
  text: {
    width: NOTE_BUBBLE_SIZE * 0.68,
    ...type.note,
    textAlign: "center",
  },
});
