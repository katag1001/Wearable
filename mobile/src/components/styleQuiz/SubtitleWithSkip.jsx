// A quiz step's subtitle (matching Screen's) with a small Skip (the plain
// text action, ui/TextAction) on the line below, at the right. Used by the optional steps, which
// pass no subtitle to Screen. Without `text` it's just the Skip.

import { StyleSheet, Text, View } from "react-native";

import { space, type } from "../../theme/soft";
import { TextAction } from "../ui/TextAction";

export const SubtitleWithSkip = ({ text, onSkip }) => (
  <View style={styles.row}>
    {text ? <Text style={styles.subtitle}>{text}</Text> : null}
    <TextAction label="Skip" onPress={onSkip} disabled={!onSkip} style={styles.skip} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    gap: space.xxs,
    marginBottom: space.xs,
  },
  subtitle: type.body,
  skip: {
    alignSelf: "flex-end",
  },
});
