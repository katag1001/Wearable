// A picture on the light image background, optionally tappable and
// selectable (black border + tick). Without a source it shows
// `placeholder` text instead.

import Feather from "@expo/vector-icons/Feather";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  radius,
  spacing,
} from "@core/theme/tokens.js";

export const ImageTile = ({
  source,
  label,
  placeholder,
  selected = false,
  onPress,
  aspectRatio = 1,
  resizeMode = "cover",
  style,
}) => {
  const content = (
    <>
      {source ? (
        <Image source={source} style={styles.image} resizeMode={resizeMode} />
      ) : (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}

      {selected ? (
        <View style={styles.check}>
          <Feather name="check" size={14} color={colors.inverse} />
        </View>
      ) : null}
    </>
  );

  const tileStyle = [
    styles.tile,
    { aspectRatio },
    selected && styles.selected,
    style,
  ];

  if (!onPress) {
    return <View style={tileStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [tileStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: {
    borderColor: colors.main,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    fontSize: fontSizes.small,
    color: colors.muted,
    textAlign: "center",
    padding: spacing.sm,
  },
  check: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
});
