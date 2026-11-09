// The top line of a page - "Hey Katy", "Wardrobe (24)", "Add" - in the
// same type and size on every tab page, with an optional plain icon
// button on the right (soft/IconButton, no circle). Place it first in the
// page, inside the page's gutter. `count` shows after the title, in the
// same light type, muted. `onBack` adds the plain back arrow before the
// title (soft/BackButton). `small` sets the smaller title of a page opened
// from another (Profile, Settings, Add item...); the icons stay the same
// size everywhere.

import { StyleSheet, Text, View } from "react-native";

import { ink, space, type } from "../../theme/soft";
import { BackButton } from "./BackButton";
import { IconButton } from "./IconButton";

export const PageHeader = ({ title, count, icon, iconLabel, onIconPress, onBack, small = false }) => (
  <View style={styles.row}>
    {onBack ? <BackButton onPress={onBack} /> : null}
    <Text style={[styles.title, small && styles.smallTitle]} numberOfLines={1}>
      {title}
      {count ? <Text style={styles.count}> ({count})</Text> : null}
    </Text>
    {icon ? <IconButton icon={icon} label={iconLabel} onPress={onIconPress} /> : null}
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
    color: ink.muted,
  },
});
