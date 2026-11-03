// A panel along the bottom of the page like the top of a card that's popped
// up: milk, big rounded top corners, a grab handle and a soft shadow above.
// Drag its top strip down to tuck it away - only the handle (PULL_UP_PEEK)
// stays showing - and drag it up (or tap the strip) to bring it back.
//
// It sits over the page (absolutely positioned at the bottom) and never
// changes the page's layout. To follow it, pass `offset` (an Animated.Value
// it drives: 0 open, up to its height - PULL_UP_PEEK tucked away, moving
// with the finger and the snap) and `onHeight(px)`; the page can then
// animate from them without re-laying anything out.

import { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import { colors, radius } from "../../theme/tokens";
import { motion } from "../../theme/soft";

// What's left showing when it's tucked away: the strip with the handle.
export const PULL_UP_PEEK = 30;
// How far, or how fast, a drag must go to open or tuck it.
const DRAG_DISTANCE = 40;
const DRAG_VELOCITY = 0.5;

export const PullUpPanel = ({ offset: givenOffset, onHeight, style, children }) => {
  const [height, setHeight] = useState(0);
  const [tucked, setTucked] = useState(false);
  const ownOffset = useRef(new Animated.Value(0)).current;
  const offset = givenOffset ?? ownOffset;

  // The pan handlers are made once, so they read the latest values here.
  const latest = useRef({});
  latest.current = { height, tucked };

  const travel = () => Math.max(0, latest.current.height - PULL_UP_PEEK);

  const settle = (toTucked) => {
    Animated.timing(offset, {
      toValue: toTucked ? travel() : 0,
      duration: motion.panel,
      easing: motion.easing,
      useNativeDriver: true,
    }).start(() => setTucked(toTucked));
  };

  const settleRef = useRef(settle);
  settleRef.current = settle;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 4,
      onPanResponderMove: (_, { dy }) => {
        const start = latest.current.tucked ? travel() : 0;
        offset.setValue(Math.min(travel(), Math.max(0, start + dy)));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        const wasTucked = latest.current.tucked;

        // A tap (no real drag) toggles it.
        if (Math.abs(dy) < 4) {
          settleRef.current(!wasTucked);
        } else if (dy > DRAG_DISTANCE || vy > DRAG_VELOCITY) {
          settleRef.current(true);
        } else if (dy < -DRAG_DISTANCE || vy < -DRAG_VELOCITY) {
          settleRef.current(false);
        } else {
          settleRef.current(wasTucked);
        }
      },
      onPanResponderTerminate: () => settleRef.current(latest.current.tucked),
    })
  ).current;

  // Tell the page its height whenever it changes (e.g. the subtype row
  // appears) - and tucked away, it stays tucked at the new height.
  useEffect(() => {
    if (!height) return;

    if (tucked) offset.setValue(travel());
    onHeight?.(height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  return (
    <Animated.View
      style={[styles.panel, style, { transform: [{ translateY: offset }] }]}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
    >
      <View
        {...pan.panHandlers}
        style={styles.strip}
        accessible
        accessibilityRole="button"
        accessibilityLabel={tucked ? "Show the clothes" : "Hide the clothes"}
        accessibilityActions={[{ name: "activate" }]}
        onAccessibilityAction={() => settle(!tucked)}
      >
        <View style={styles.handle} />
      </View>

      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.pageBackground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderCurve: "continuous",
    boxShadow: "0px -10px 30px rgba(46, 40, 56, 0.07)",
  },
  // Full width and as tall as the peek, so it's easy to grab.
  strip: {
    height: PULL_UP_PEEK,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.imageBackground,
  },
});
