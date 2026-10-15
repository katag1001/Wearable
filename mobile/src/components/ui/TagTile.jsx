// A tag ("Work", "Gym"...) as its icon with the name underneath,
// selectable. `tag` is a tagOptions entry ({ name, image }).

import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import { ImageTile } from "./ImageTile";

export const TagTile = ({ tag, selected, onPress }) => (
  <View style={styles.tag}>
    <ImageTile
      source={tag.image}
      label={tag.name}
      selected={selected}
      onPress={onPress}
      resizeMode="contain"
    />
    <Text style={styles.name} numberOfLines={1}>
      {tag.name}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tag: {
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSizes.tag,
    color: colors.secondary,
    textAlign: "center",
  },
});
