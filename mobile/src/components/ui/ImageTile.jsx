// A picture on pearl (the item background, a hue-free warm white),
// optionally tappable and selectable (the selection ring + the selected
// tick, ui/SelectedTick). Squeezes when pressed. Without a source it shows
// `placeholder` text instead.

import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/tokens";
import { radii, space, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";
import { SelectionHalo } from "../soft/SelectionHalo";
import { SelectedTick } from "./SelectedTick";

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
          <SelectionHalo radius={radii.tile} />
          <SelectedTick />
        </>
      ) : null}
    </>
  );

  const tileStyle = [styles.tile, { aspectRatio }, style];

  if (!onPress) {
    return <View style={tileStyle}>{content}</View>;
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={tileStyle}
    >
      {content}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.tile,
    borderCurve: "continuous",
    backgroundColor: colors.itemBackground,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    ...type.caption,
    textAlign: "center",
    padding: space.xs,
  },
});
