// A heading inside a screen, with an optional line of description
// (type.caption). Over prose (Settings) the title is a light heading;
// `field` makes it a field's label instead - the small spaced capitals a
// text field's label uses - for the fields of a form, the outfit's details
// and the filters.

import { StyleSheet, Text, View } from "react-native";

import { space, type } from "../../theme/soft";

// Without a title, the description sits on the row with `right`.
export const SectionTitle = ({ title, description, right, field = false }) => {
  const descriptionText = description ? (
    <Text style={styles.description}>{description}</Text>
  ) : null;

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        {title ? (
          <Text style={field ? styles.fieldTitle : styles.title}>{title}</Text>
        ) : (
          descriptionText
        )}
        {right}
      </View>
      {title ? descriptionText : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: space.xxs,
    marginTop: space.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: type.sectionTitle,
  fieldTitle: type.eyebrow,
  description: type.caption,
});
