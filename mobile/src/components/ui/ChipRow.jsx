// Chips that wrap onto as many lines as they need, or (`scroll`) stay on
// one line and scroll sideways.

import { ScrollView, StyleSheet, View } from "react-native";

import { spacing } from "../../theme/tokens";

export const ChipRow = ({ scroll = false, children }) =>
  scroll ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.row, styles.wrap]}>{children}</View>
  );

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  wrap: {
    flexWrap: "wrap",
  },
});
