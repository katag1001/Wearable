// The X at the bottom of the outfit while a note bubble is dragged
// (NoteBubble): let go of the bubble on it and the bubble goes. In the
// bottom middle, between the hearts and the shoe. Fades in when a drag
// starts; `hot` (the bubble is over it) fills it in blush and grows it.

import Feather from "@expo/vector-icons/Feather";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { ink, loved, motion, shadows, space, surface } from "../../theme/soft";

export const DISMISS_SIZE = 52;

// How close the bubble's middle has to come to the X's middle.
export const DISMISS_REACH = 48;

// The X's middle in the picker.
export const dismissCentre = ({ width, height }) => ({
  x: width / 2,
  y: height - space.sm - DISMISS_SIZE / 2,
});

export const DismissTarget = ({ hot }) => {
  const shown = useRef(new Animated.Value(0)).current;
  const grown = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(shown, {
      toValue: 1,
      duration: motion.press,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();
  }, [shown]);

  useEffect(() => {
    Animated.timing(grown, {
      toValue: hot ? 1 : 0,
      duration: motion.press,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();
  }, [hot, grown]);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.target,
        hot && styles.hot,
        {
          opacity: shown,
          transform: [{ scale: grown.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
        },
      ]}
    >
      <Feather name="x" size={24} color={hot ? loved.deep : ink.soft} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  target: {
    position: "absolute",
    left: "50%",
    bottom: space.sm,
    width: DISMISS_SIZE,
    height: DISMISS_SIZE,
    marginLeft: -DISMISS_SIZE / 2,
    borderRadius: DISMISS_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: surface.veil,
    boxShadow: shadows.soft,
  },
  hot: {
    backgroundColor: loved.wash,
  },
});
