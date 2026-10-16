// A burst of confetti from the bottom of the screen, up the page, then
// fading out. Plays once on mount and calls onDone when it's finished.
// Sits over everything without catching touches - place it last, filling
// its parent (it's absolutely positioned).
//
// Built on Animated (native driver), so no confetti library is needed.

import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

const PIECES = 56;
const COLORS = ["#111", "#99938b", "#ddd8d0", "#c9a227", "#e07a5f", "#8fb3a3"];

const between = (min, max) => min + Math.random() * (max - min);

const makePiece = (index, width, height) => {
  const round = index % 4 === 0;
  const size = between(6, 10);

  return {
    key: index,
    left: between(0, width),
    color: COLORS[index % COLORS.length],
    width: size,
    height: round ? size : size * 1.6,
    radius: round ? size / 2 : 1,
    rise: between(0.35, 0.95) * height,
    drift: between(-70, 70),
    spin: between(360, 900) * (Math.random() < 0.5 ? -1 : 1),
    delay: between(0, 250),
    duration: between(1300, 1900),
    progress: new Animated.Value(0),
  };
};

export const Confetti = ({ onDone }) => {
  const { width, height } = useWindowDimensions();

  // Made once, so a re-render mid-burst doesn't restart it.
  const pieces = useMemo(
    () => Array.from({ length: PIECES }, (_, index) => makePiece(index, width, height)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const burst = Animated.parallel(
      pieces.map((piece) =>
        Animated.timing(piece.progress, {
          toValue: 1,
          duration: piece.duration,
          delay: piece.delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    );

    burst.start(() => onDoneRef.current?.());

    return () => burst.stop();
  }, [pieces]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece) => {
        const { progress } = piece;

        return (
          <Animated.View
            key={piece.key}
            style={[
              styles.piece,
              {
                left: piece.left,
                width: piece.width,
                height: piece.height,
                borderRadius: piece.radius,
                backgroundColor: piece.color,
                opacity: progress.interpolate({
                  inputRange: [0, 0.65, 1],
                  outputRange: [1, 1, 0],
                }),
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -piece.rise],
                    }),
                  },
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, piece.drift, piece.drift * 0.6],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", `${piece.spin}deg`],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: "absolute",
    bottom: -12,
  },
});
