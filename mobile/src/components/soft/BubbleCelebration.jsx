// Soap bubbles rising from the bottom of the screen, wobbling as they go,
// then swelling slightly and popping (fading). Plays once on mount and
// calls onDone when it's finished. Sits over everything without catching
// touches - place it last, filling its parent. The soft today/Confetti.

import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { Bubble } from "./Bubble";

const BUBBLES = 18;

const between = (min, max) => min + Math.random() * (max - min);

const makeBubble = (index, width, height) => ({
  key: index,
  size: between(26, 78),
  left: between(-10, width - 40),
  variant: index % 3,
  rise: between(0.45, 0.95) * height,
  wobble: between(14, 32) * (Math.random() < 0.5 ? -1 : 1),
  delay: between(0, 550),
  duration: between(2200, 3200),
  progress: new Animated.Value(0),
});

export const BubbleCelebration = ({ onDone }) => {
  const { width, height } = useWindowDimensions();

  // Made once, so a re-render mid-rise doesn't restart it.
  const bubbles = useMemo(
    () => Array.from({ length: BUBBLES }, (_, index) => makeBubble(index, width, height)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const rise = Animated.parallel(
      bubbles.map((bubble) =>
        Animated.timing(bubble.progress, {
          toValue: 1,
          duration: bubble.duration,
          delay: bubble.delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    );

    rise.start(() => onDoneRef.current?.());

    return () => rise.stop();
  }, [bubbles]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {bubbles.map((bubble) => {
        const { progress } = bubble;

        return (
          <Animated.View
            key={bubble.key}
            style={[
              styles.bubble,
              {
                left: bubble.left,
                bottom: -bubble.size,
                opacity: progress.interpolate({
                  inputRange: [0, 0.1, 0.82, 0.92, 1],
                  outputRange: [0, 1, 1, 0.4, 0],
                }),
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -bubble.rise],
                    }),
                  },
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, bubble.wobble, 0, -bubble.wobble, 0],
                    }),
                  },
                  {
                    // The pop: a small swell as it fades.
                    scale: progress.interpolate({
                      inputRange: [0, 0.82, 1],
                      outputRange: [0.9, 1, 1.25],
                    }),
                  },
                ],
              },
            ]}
          >
            <Bubble size={bubble.size} variant={bubble.variant} />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
  },
});
