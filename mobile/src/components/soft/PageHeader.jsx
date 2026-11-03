// The top line of a tab page - "Hey Katy", "Wardrobe (24)", "Outfits" - in
// the same type and size everywhere, with an optional plain icon button
// on the right (no circle). Place it first in the page, inside the page's
// gutter. `count` shows after the title, smaller.

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ink, space, type } from "../../theme/soft";

export const PageHeader = ({ title, count, icon, iconLabel, onIconPress }) => (
  <View style={styles.row}>
    <Text style={styles.title} numberOfLines={1}>
      {title}
      {count ? <Text style={styles.count}> ({count})</Text> : null}
    </Text>

    {icon ? (
      <Pressable
        onPress={onIconPress}
        accessibilityRole="button"
        accessibilityLabel={iconLabel}
        hitSlop={12}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Feather name={icon} size={24} color={ink.soft} />
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  title: {
    ...type.pageTitle,
    flexShrink: 1,
  },
  count: {
    ...type.body,
  },
  pressed: {
    opacity: 0.5,
  },
});
