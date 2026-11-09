// The top line of a tab page - "Hey Katy", "Wardrobe (24)", "Outfits" - in
// the same type and size everywhere, with an optional plain icon button
// on the right (no circle). Place it first in the page, inside the page's
// gutter. `count` shows after the title, smaller. `onBack` adds a plain
// back arrow before the title (pages opened on top, like Profile).
// `small` sets a smaller title and icons (Profile).

import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ink, space, type } from "../../theme/soft";

export const PageHeader = ({ title, count, icon, iconLabel, onIconPress, onBack, small = false }) => (
  <View style={styles.row}>
    {onBack ? (
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Feather name="arrow-left" size={small ? 20 : 24} color={ink.soft} />
      </Pressable>
    ) : null}

    <Text style={[styles.title, small && styles.smallTitle]} numberOfLines={1}>
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
        <Feather name={icon} size={small ? 20 : 24} color={ink.soft} />
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
    flex: 1,
  },
  smallTitle: type.menuTitle,
  count: {
    ...type.body,
  },
  pressed: {
    opacity: 0.5,
  },
});
