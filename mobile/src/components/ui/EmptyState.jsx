// What a screen or list shows when there's nothing in it: a faint bubble,
// a light title and a line of text, centred in the space it's given.
// `compact` (a short row, a sheet, a carousel slot): just the title, as a
// line of body text. Titles have no full stop.

import { StyleSheet, Text, View } from "react-native";

import { space, type } from "../../theme/soft";
import { Bubble } from "../soft/Bubble";

export const EmptyState = ({ title, text, compact = false, style, children }) => (
  <View style={[styles.empty, compact && styles.compact, style]}>
    {compact ? null : <Bubble size={64} opacity={0.9} />}
    <Text style={compact ? styles.compactTitle : styles.title}>{title}</Text>
    {text ? <Text style={styles.text}>{text}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    padding: space.lg,
  },
  compact: {
    flex: 0,
    padding: space.md,
  },
  title: {
    ...type.cardTitle,
    textAlign: "center",
  },
  compactTitle: {
    ...type.body,
    textAlign: "center",
  },
  text: {
    ...type.body,
    textAlign: "center",
  },
});
