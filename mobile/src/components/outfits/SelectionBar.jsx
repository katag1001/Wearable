// Shown while outfits are selected, floating over the bottom of the list:
// the house box with how many are picked, Clear, and Delete (in rose-clay)
// as plain text actions. Position it with `style`.

import { StyleSheet, Text, View } from "react-native";

import { houseBox, space, type } from "../../theme/soft";
import { TextAction } from "../ui";

export const SelectionBar = ({ count, onClear, onDelete, style }) => (
  <View style={[styles.bar, style]}>
    <Text style={styles.count}>{count} selected</Text>
    <TextAction label="Clear" onPress={onClear} />
    <TextAction label="Delete" tone="error" onPress={onDelete} />
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    ...houseBox,
  },
  count: {
    ...type.menuLabel,
    flex: 1,
  },
});
