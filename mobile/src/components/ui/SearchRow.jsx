// A search box with the filter button beside it, a plain icon like the
// header's (Wardrobe and Outfits).

import { StyleSheet, View } from "react-native";

import { space } from "../../theme/soft";
import { IconButton } from "../soft/IconButton";
import { TextField } from "./TextField";

export const SearchRow = ({ placeholder, value, onChangeText, onFilters }) => (
  <View style={styles.row}>
    <TextField
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      returnKeyType="search"
      style={styles.search}
    />
    <IconButton icon="sliders" label="Filters" onPress={onFilters} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  search: {
    flex: 1,
  },
});
