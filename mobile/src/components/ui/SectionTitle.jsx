// A heading inside a screen, with an optional line of description.

import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../theme/tokens";
import { type } from "../../theme/soft";

// Without a title, the description sits on the row with `right`.
export const SectionTitle = ({ title, description, right }) => {
  const descriptionText = description ? (
    <Text style={styles.description}>{description}</Text>
  ) : null;

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        {title ? <Text style={styles.title}>{title}</Text> : descriptionText}
        {right}
      </View>
      {title ? descriptionText : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: type.sectionTitle,
  description: type.sectionText,
});
