// The tour on screen, over the whole of the tabs (tab bar included) while
// it runs. The app looks exactly as it always does - nothing dims or
// highlights it - with just a speech bubble beside the step's element: a
// milk box, its solid little arrow pointing at the element, with the
// step's title and text, Skip tour, Back and Next. The bubble sits on
// whichever side of the element has more room. Taps anywhere else do
// nothing; Android's back button skips.

import { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, TextAction } from "../components/ui";
import { motion, radii, space, tourBubble, type } from "../theme/soft";
import { useTour } from "./TourProvider";

// Space between the element and the tip of the arrow.
const GAP = space.xxs;
// The bubble's arrow: a square turned 45°, half of it showing - big
// enough to read clearly as pointing. Its tip reaches half its diagonal
// past the bubble's edge.
const ARROW = 26;
const ARROW_REACH = ARROW * Math.SQRT1_2;
const MEASURE_RETRY_MS = 100;
const MEASURE_ATTEMPTS = 30;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const TourOverlay = () => {
  const tour = useTour();
  const insets = useSafeAreaInsets();
  const overlayRef = useRef(null);
  const [frame, setFrame] = useState(null);
  const [rect, setRect] = useState(null);
  const [bubbleHeight, setBubbleHeight] = useState(0);
  const shown = useRef(new Animated.Value(0)).current;

  const running = Boolean(tour?.running);
  const step = tour?.step;

  // Where the overlay itself sits on the screen, to turn the element's
  // screen position into one inside it.
  const measureFrame = () => {
    overlayRef.current?.measureInWindow((x, y, width, height) =>
      setFrame({ x, y, width, height })
    );
  };

  // Find the step's element - it may still be drawing (Today's sample
  // outfit), so try again for a few seconds.
  useEffect(() => {
    setRect(null);
    if (!running || !step || !frame) return undefined;

    let timer = null;
    let cancelled = false;

    const measure = (attempt) => {
      const retry = () => {
        if (attempt < MEASURE_ATTEMPTS) {
          timer = setTimeout(() => measure(attempt + 1), MEASURE_RETRY_MS);
        }
      };
      const node = tour.getTarget(step.target);

      if (!node) {
        retry();
        return;
      }

      node.measureInWindow((x, y, w, h) => {
        if (cancelled) return;
        if (!w || !h) {
          retry();
          return;
        }
        setRect({ x: x - frame.x, y: y - frame.y, w, h });
      });
    };

    measure(0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, step, frame]);

  // Each bubble eases in once its element is found.
  useEffect(() => {
    if (!rect) return;
    shown.setValue(0);
    Animated.timing(shown, {
      toValue: 1,
      duration: motion.panel,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();
  }, [rect, shown]);

  useEffect(() => {
    if (!running) return undefined;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      tour.skip();
      return true;
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  if (!running) return null;

  const width = frame?.width ?? 0;
  const height = frame?.height ?? 0;

  // The element with a little room round it.
  const hole = rect
    ? { x: rect.x - GAP, y: rect.y - GAP, w: rect.w + GAP * 2, h: rect.h + GAP * 2 }
    : null;

  const bubbleWidth = width - space.gutter * 2;
  const roomAbove = hole ? hole.y : 0;
  const roomBelow = hole ? height - (hole.y + hole.h) : 0;
  const below = roomBelow >= roomAbove;
  const bubbleTop = hole
    ? clamp(
        below ? hole.y + hole.h + ARROW_REACH : hole.y - ARROW_REACH - bubbleHeight,
        insets.top + space.sm,
        height - bubbleHeight - space.sm
      )
    : 0;
  const targetCentre = hole ? hole.x + hole.w / 2 : 0;
  const arrowLeft = clamp(
    targetCentre - space.gutter - ARROW / 2,
    radii.card,
    bubbleWidth - radii.card - ARROW
  );
  const last = tour.stepIndex === tour.stepCount - 1;

  return (
    <View
      ref={overlayRef}
      style={StyleSheet.absoluteFill}
      onLayout={measureFrame}
      collapsable={false}
    >
      {hole && width ? (
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => setBubbleHeight(event.nativeEvent.layout.height)}
          style={[
            styles.bubble,
            {
              top: bubbleTop,
              left: space.gutter,
              width: bubbleWidth,
              opacity: bubbleHeight ? shown : 0,
            },
          ]}
        >
          {/* Behind the card, so only its outer half (and shadow) shows. */}
          <View
            style={[
              styles.arrow,
              { left: arrowLeft },
              below ? { top: -ARROW / 2 } : { bottom: -ARROW / 2 },
            ]}
          />

          <View style={styles.card}>
            <Text style={styles.count}>
              {tour.stepIndex + 1} of {tour.stepCount}
            </Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.text}>{step.text}</Text>

            <View style={styles.actions}>
              <TextAction label="Skip tour" onPress={tour.skip} />
              <View style={styles.steps}>
                {tour.stepIndex > 0 ? (
                  <TextAction label="Back" onPress={tour.back} />
                ) : null}
                <Button label={last ? "Done" : "Next"} onPress={tour.next} />
              </View>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
  },
  card: {
    padding: space.lg,
    gap: space.xs,
    borderRadius: radii.card,
    borderCurve: "continuous",
    backgroundColor: tourBubble.fill,
    boxShadow: tourBubble.shadow,
  },
  arrow: {
    position: "absolute",
    width: ARROW,
    height: ARROW,
    backgroundColor: tourBubble.arrow,
    boxShadow: tourBubble.arrowShadow,
    transform: [{ rotate: "45deg" }],
  },
  count: type.eyebrow,
  title: type.menuTitle,
  text: type.body,
  actions: {
    marginTop: space.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // Back beside Next, like the style quiz.
  steps: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
});
