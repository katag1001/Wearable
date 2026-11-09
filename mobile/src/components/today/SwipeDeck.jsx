// A Tinder-style card: drag it sideways, or tap the narrow arrows either
// side, and it flies off and the next one slides in. Left goes to the
// next card, right to the previous one. Nothing is swipeable with one
// card or fewer (`enabled` false). `fill`: the deck takes all the height
// it's given and the card stretches to it (otherwise it's as tall as its
// content).
//
// `cardKey`: what's on the card (e.g. the outfit's id). Given, the next
// card only slides in once it has changed - so the card leaving never
// slides back in for the moment before the new one is drawn.
//
// `header`: shown across the top of the deck (over the arrows too), sliding
// sideways with the card - e.g. Today's note banner.
//
// Built on PanResponder + Animated, so no gesture library is needed.

import { useEffect, useLayoutEffect, useRef } from "react";
import Feather from "@expo/vector-icons/Feather";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ink, motion, space } from "../../theme/soft";

// How far (px) or fast (px/ms) a drag must go to count as a swipe.
const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 0.5;
// A drag only becomes a swipe once it's clearly sideways, so the page can
// still scroll vertically.
const DRAG_START = 10;
const MAX_TILT = 10; // degrees, at a full screen width of drag

// The chevron is squeezed sideways to read narrow; its slot is the
// squeezed width, so nothing hangs over the edge.
const ARROW_SIZE = 36;
const ARROW_SQUEEZE = 0.75;
const ARROW_SLOT = Math.ceil(ARROW_SIZE * ARROW_SQUEEZE);

const Arrow = ({ name, label, onPress, hidden }) => (
  <Pressable
    onPress={onPress}
    disabled={hidden}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={{ top: 24, bottom: 24, left: 8, right: 8 }}
    style={({ pressed }) => [
      styles.arrow,
      hidden && styles.hidden,
      pressed && styles.pressed,
    ]}
  >
    <Feather
      name={name}
      size={ARROW_SIZE}
      color={ink.muted}
      style={styles.chevron}
    />
  </Pressable>
);

export const SwipeDeck = ({
  enabled,
  onNext,
  onPrev,
  noun,
  fill = false,
  cardKey,
  header,
  children,
}) => {
  const x = useRef(new Animated.Value(0)).current;
  const animating = useRef(false);
  // With cardKey: the side the next card comes in from, until it's drawn,
  // and a fallback in case the card doesn't change.
  const waiting = useRef(null);
  const fallback = useRef(null);

  // The pan handlers are made once, so they read the latest props here.
  const latest = useRef({});
  latest.current = { enabled, onNext, onPrev, hasCardKey: cardKey !== undefined };

  // direction -1: off to the left, then the next card. 1: off to the
  // right, then the previous one.
  const swipe = (direction) => {
    if (animating.current || !latest.current.enabled) return;
    animating.current = true;

    const offscreen = Dimensions.get("window").width;

    Animated.timing(x, {
      toValue: direction * offscreen,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      // The new card comes in from the opposite side - with cardKey, once
      // it's drawn (the layout effect below).
      if (latest.current.hasCardKey) {
        waiting.current = -direction;
        fallback.current = setTimeout(() => slideIn(), 300);
      }

      if (direction < 0) latest.current.onNext();
      else latest.current.onPrev();

      if (!latest.current.hasCardKey) slideIn(-direction);
    });
  };

  // `side`: -1 from the left, 1 from the right.
  const slideIn = (side = waiting.current) => {
    clearTimeout(fallback.current);
    waiting.current = null;
    if (side == null) return;

    x.setValue(side * Dimensions.get("window").width);
    Animated.timing(x, {
      toValue: 0,
      duration: motion.panel,
      easing: motion.easing,
      useNativeDriver: true,
    }).start(() => {
      animating.current = false;
    });
  };

  // Before the new card is painted, so it's first drawn off screen.
  useLayoutEffect(() => {
    if (waiting.current != null) slideIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardKey]);

  useEffect(() => () => clearTimeout(fallback.current), []);

  const settle = () =>
    Animated.timing(x, {
      toValue: 0,
      duration: motion.press,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();

  const swipeRef = useRef(swipe);
  swipeRef.current = swipe;

  const isSideways = (_, { dx, dy }) =>
    latest.current.enabled &&
    !animating.current &&
    Math.abs(dx) > DRAG_START &&
    Math.abs(dx) > Math.abs(dy) * 1.5;

  // Claimed in the capture phase too, so a card filled by a photo (which
  // would otherwise keep the touch) still swipes.
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: isSideways,
      onMoveShouldSetPanResponderCapture: isSideways,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, { dx }) => x.setValue(dx),
      onPanResponderRelease: (_, { dx, vx }) => {
        if (dx < -SWIPE_DISTANCE || vx < -SWIPE_VELOCITY) swipeRef.current(-1);
        else if (dx > SWIPE_DISTANCE || vx > SWIPE_VELOCITY) swipeRef.current(1);
        else settle();
      },
      onPanResponderTerminate: settle,
    })
  ).current;

  const width = Dimensions.get("window").width;
  const rotate = x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [`-${MAX_TILT}deg`, "0deg", `${MAX_TILT}deg`],
  });

  const deck = (
    <View style={[styles.deck, fill && styles.fill]}>
      <Arrow
        name="chevron-left"
        label={`Previous ${noun}`}
        onPress={() => swipe(1)}
        hidden={!enabled}
      />

      <Animated.View
        style={[styles.card, { transform: [{ translateX: x }, { rotate }] }]}
        {...pan.panHandlers}
      >
        {children}
      </Animated.View>

      <Arrow
        name="chevron-right"
        label={`Next ${noun}`}
        onPress={() => swipe(-1)}
        hidden={!enabled}
      />
    </View>
  );

  if (!header) return deck;

  // The header across the top, arrows and all, sliding with the card (no
  // tilt). Its own box is the full width, so on Android its edges still
  // take taps - they'd be lost hanging out of the card.
  return (
    <View style={fill && styles.fill}>
      <Animated.View style={{ transform: [{ translateX: x }] }} {...pan.panHandlers}>
        {header}
      </Animated.View>
      {deck}
    </View>
  );
};

const styles = StyleSheet.create({
  deck: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xxs,
  },
  fill: {
    flex: 1,
    alignItems: "stretch",
  },
  card: {
    flex: 1,
  },
  // Above the card, so a dragged card slides underneath them.
  arrow: {
    width: ARROW_SLOT,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    elevation: 1,
  },
  chevron: {
    width: ARROW_SIZE,
    textAlign: "center",
    transform: [{ scaleX: ARROW_SQUEEZE }],
  },
  hidden: {
    opacity: 0,
  },
  pressed: {
    opacity: 0.5,
  },
});
