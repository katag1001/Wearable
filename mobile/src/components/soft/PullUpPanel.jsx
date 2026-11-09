// A panel along the bottom of the page like the top of a card that's popped
// up: milk, the panels' rounded top corners and light top rim (like Today's
// bottom panel) and a grab handle.
// Drag its top strip to move it between its `stops` - how much of it shows
// - and it snaps to the nearest (a flick goes on to the next one). Tapping
// the strip tucks it away, or from tucked away brings it back to
// `initialStop`.
//
// `stops`: how much shows at each stop, lowest first, in px - or "full"
// for all of it. The lowest is usually PULL_UP_PEEK (just the strip with
// the handle). Default: tucked away or fully open. Give the panel a
// `style` height when it's taller than its content needs ("full" is
// then that height).
//
// `dragContent`: while it isn't fully open, an up or down drag anywhere on
// its content moves the panel too (not just the strip) - so a panel part
// way up opens fully from its content whether or not that content can
// scroll; fully open, the content scrolls as usual. Sideways drags (a
// slider, a row of chips) are left to the content.
//
// It sits over the page (absolutely positioned at the bottom) and never
// changes the page's layout. To follow it, pass `offset` (an Animated.Value
// it drives: how far it's moved down from fully open, following the finger
// and the snap) and `onHeight(px)`; the page can then animate from them
// without re-laying anything out (e.g. useOutfitFollowsPanel).
//
// Below a stop that isn't fully open, the bottom of the panel is below the
// screen. Scrolling content goes in a PullUpScrollView, which is padded by
// that much (usePullUpBelowScreen), so it scrolls to its end at any stop.

import { createContext, use, useEffect, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import { colors } from "../../theme/tokens";
import { boxEdge, motion, radii } from "../../theme/soft";

// What's left showing when it's tucked away: the strip with the handle.
export const PULL_UP_PEEK = 30;
// How far, or how fast, a drag must go to count as a flick to the next stop.
const DRAG_DISTANCE = 40;
const DRAG_VELOCITY = 0.5;
const TAP = 4;

// How much of the panel is below the screen at the stop it's settled at.
const BelowScreen = createContext(0);
export const usePullUpBelowScreen = () => use(BelowScreen);

// How far down the panel has moved at a stop.
export const stopOffset = (stop, height) =>
  stop === "full" ? 0 : Math.max(0, height - Math.min(stop, height));

export const PullUpPanel = ({
  stops = [PULL_UP_PEEK, "full"],
  initialStop = stops.length - 1,
  offset: givenOffset,
  onHeight,
  dragContent = false,
  style,
  children,
}) => {
  const [height, setHeight] = useState(0);
  const [stopIndex, setStopIndex] = useState(initialStop);
  const ownOffset = useRef(new Animated.Value(0)).current;
  const offset = givenOffset ?? ownOffset;

  // The pan handlers are made once, so they read the latest values here.
  const latest = useRef({});
  latest.current = {
    height,
    stopIndex,
    stops,
    initialStop,
    dragContent,
  };

  const offsetAt = (index) =>
    stopOffset(latest.current.stops[index], latest.current.height);

  const settle = (index) => {
    Animated.timing(offset, {
      toValue: offsetAt(index),
      duration: motion.panel,
      easing: motion.easing,
      useNativeDriver: true,
    }).start(() => setStopIndex(index));
  };

  const settleRef = useRef(settle);
  settleRef.current = settle;

  // The stop to go to on letting go at `position` (px down from fully
  // open). Stops run from tucked away (0, the furthest down) upwards.
  const stopAfterDrag = (position, dy, vy) => {
    const indexes = [...latest.current.stops.keys()];

    // A flick down: the nearest stop below where it was let go.
    if (dy > DRAG_DISTANCE || vy > DRAG_VELOCITY) {
      const below = indexes.filter((i) => offsetAt(i) > position);
      return below.length ? Math.max(...below) : 0;
    }

    // A flick up: the nearest stop above it.
    if (dy < -DRAG_DISTANCE || vy < -DRAG_VELOCITY) {
      const above = indexes.filter((i) => offsetAt(i) < position);
      return above.length ? Math.min(...above) : indexes.length - 1;
    }

    // A small drag: the nearest stop.
    const distance = (i) => Math.abs(offsetAt(i) - position);
    return indexes.reduce((best, i) => (distance(i) < distance(best) ? i : best));
  };

  // Dragging the panel - from the strip, or (dragContent) its content.
  const dragging = {
    onPanResponderMove: (_, { dy }) => {
      const start = offsetAt(latest.current.stopIndex);
      const lowest = offsetAt(0);
      offset.setValue(Math.min(lowest, Math.max(0, start + dy)));
    },
    onPanResponderRelease: (_, { dy, vy }) => {
      const from = latest.current.stopIndex;
      const position = Math.min(offsetAt(0), Math.max(0, offsetAt(from) + dy));
      settleRef.current(stopAfterDrag(position, dy, vy));
    },
    onPanResponderTerminate: () => settleRef.current(latest.current.stopIndex),
  };

  // Content drags: only up / down ones, only while not fully open, and
  // claimed before the content's own scroll view sees them.
  const contentPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, { dx, dy }) =>
        latest.current.dragContent &&
        latest.current.stopIndex !== latest.current.stops.length - 1 &&
        Math.abs(dy) > TAP * 2 &&
        Math.abs(dy) > Math.abs(dx) * 1.5,
      onPanResponderTerminationRequest: () => false,
      ...dragging,
    })
  ).current;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > TAP,
      onPanResponderMove: (_, { dy }) => {
        const start = offsetAt(latest.current.stopIndex);
        const lowest = offsetAt(0);
        offset.setValue(Math.min(lowest, Math.max(0, start + dy)));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        const { stopIndex: from, initialStop: home } = latest.current;

        // A tap (no real drag): tuck away, or back to where it started.
        if (Math.abs(dy) < TAP) {
          settleRef.current(from === 0 ? Math.max(1, home) : 0);
          return;
        }

        const position = Math.min(offsetAt(0), Math.max(0, offsetAt(from) + dy));
        settleRef.current(stopAfterDrag(position, dy, vy));
      },
      onPanResponderTerminate: () => settleRef.current(latest.current.stopIndex),
    })
  ).current;

  // Tell the page its height whenever it changes (e.g. a new row of chips)
  // and stay at the same stop at the new height.
  useEffect(() => {
    if (!height) return;

    offset.setValue(offsetAt(stopIndex));
    onHeight?.(height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  const tucked = stopIndex === 0;
  const belowScreen = height ? stopOffset(stops[stopIndex], height) : 0;

  return (
    <Animated.View
      style={[
        styles.panel,
        style,
        // Hidden until it knows its height, so it never flashes fully open
        // before moving to its first stop.
        { opacity: height ? 1 : 0, transform: [{ translateY: offset }] },
      ]}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
    >
      <View
        {...pan.panHandlers}
        style={styles.strip}
        accessible
        accessibilityRole="button"
        accessibilityLabel={tucked ? "Show more" : "Show less"}
        accessibilityActions={[{ name: "activate" }]}
        onAccessibilityAction={() =>
          settle(tucked ? Math.max(1, initialStop) : 0)
        }
      >
        <View style={styles.handle} />
      </View>

      <View style={styles.content} {...contentPan.panHandlers}>
        <BelowScreen value={belowScreen}>{children}</BelowScreen>
      </View>
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
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderCurve: "continuous",
    ...boxEdge,
  },
  // Fills the rest of a panel with a set height.
  content: {
    flexGrow: 1,
    flexShrink: 1,
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
    borderRadius: radii.pill,
    backgroundColor: colors.imageBackground,
  },
});
