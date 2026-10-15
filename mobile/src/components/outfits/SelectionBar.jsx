// Shown while outfits are selected: how many, Clear, and Delete.

import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";

import { Button } from "../ui";

export const SelectionBar = ({ count, onClear, onDelete }) => (
  <View style={styles.bar}>
    <Text style={styles.count}>{count} selected</Text>
    <Button label="Clear" variant="text" onPress={onClear} />
    <Button label="Delete" variant="secondary" onPress={onDelete} />
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.imageBackground,
  },
  count: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    color: colors.main,
  },
});
