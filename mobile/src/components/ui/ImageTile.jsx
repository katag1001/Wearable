// A picture on pearl (the item background, a hue-free warm white),
// optionally tappable and selectable (an iridescent halo + a tick in a
// small white bubble). Without a source it shows `placeholder` text
// instead.

import Feather from "@expo/vector-icons/Feather";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";
import { SelectionHalo } from "../soft/SelectionHalo";

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
        <>
          <SelectionHalo radius={radius.lg} />
          <View style={styles.check}>
            <Feather name="check" size={14} color={colors.main} />
          </View>
        </>
      ) : null}
    </>
  );

  const tileStyle = [styles.tile, { aspectRatio }, style];

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
    borderCurve: "continuous",
    backgroundColor: colors.itemBackground,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.small,
    color: colors.muted,
    textAlign: "center",
    padding: spacing.sm,
  },
  check: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.inverse,
    boxShadow: shadows.soft,
    alignItems: "center",
    justifyContent: "center",
  },
});
