// A centred spinner with an optional line of text, for whole-screen loads.

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

export const Loading = ({ text }) => (
  <View style={styles.loading}>
    <ActivityIndicator color={colors.main} />
    {text ? <Text style={styles.text}>{text}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.pageBackground,
  },
  text: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
});
