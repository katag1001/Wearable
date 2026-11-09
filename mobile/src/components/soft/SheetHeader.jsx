// A sheet's or full-page chooser's title with the cross that closes it, on
// one line (ui/Sheet, today/ShoeChooser, today/OutfitFeedback).

import { StyleSheet, Text, View } from "react-native";

import { type } from "../../theme/soft";
import { IconButton } from "./IconButton";

export const SheetHeader = ({ title, onClose, style }) => (
  <View style={[styles.header, style]}>
    <Text style={styles.title}>{title}</Text>
    <IconButton icon="x" label="Close" tone="quiet" onPress={onClose} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: type.sheetTitle,
});
