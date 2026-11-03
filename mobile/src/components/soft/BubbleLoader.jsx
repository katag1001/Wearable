// A single bubble breathing (0.96 <-> 1.04 over 2.4s) with an optional
// line of text, centred in the space it's given. The soft ui/Loading.

import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { space, type } from "../../theme/soft";
import { Bubble } from "./Bubble";

export const BubbleLoader = ({ text, size = 56 }) => {
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [breath]);

  return (
    <View style={styles.loader} accessibilityRole="progressbar" accessibilityLabel={text}>
      <Animated.View
        style={{
          transform: [
            { scale: breath.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }) },
            { rotate: breath.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "40deg"] }) },
          ],
        }}
      >
        <Bubble size={size} />
      </Animated.View>
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  text: {
    ...type.eyebrow,
  },
});
