// A Pressable that squeezes slightly while held (scale 0.97, eased),
// instead of dimming. `style` may be a function of { pressed }, as with
// Pressable, and lays out the pressable itself (flex, margins...). Any
// other Pressable prop passes through.

import { useRef, useState } from "react";
import { Animated, Pressable } from "react-native";

import { motion } from "../../theme/soft";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale = ({ style, children, onPressIn, onPressOut, ...props }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const animateTo = (toValue) =>
    Animated.timing(scale, {
      toValue,
      duration: motion.press,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        setPressed(true);
        animateTo(motion.pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        animateTo(1);
        onPressOut?.(event);
      }}
      style={[
        typeof style === "function" ? style({ pressed }) : style,
        { transform: [{ scale }] },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};
