// A summary row: a field's label (the small spaced capitals every field
// label uses) over its value, with a small text action on the right (e.g.
// "Change"). `children` show under the row when it's open - e.g. the
// field's picker. `swatches` (colour hexes) show as small circles with a
// white ring before the value. Rows are separated by space, not lines.

import { StyleSheet, Text, View } from "react-native";

import { radii, shadows, space, surface, type } from "../../theme/soft";
import { TextAction } from "./TextAction";

export const FieldRow = ({
  label,
  value,
  swatches = [],
  actionLabel,
  onAction,
  open = false,
  children,
}) => (
  <View style={styles.field}>
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          {swatches.map((swatch, index) => (
            <View key={`${swatch}-${index}`} style={[styles.swatch, { backgroundColor: swatch }]} />
          ))}
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      <TextAction
        label={actionLabel}
        onPress={onAction}
        accessibilityLabel={`${actionLabel} ${label.toLowerCase()}`}
        accessibilityState={{ expanded: open }}
      />
    </View>
    {open ? <View style={styles.content}>{children}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  field: {
    paddingVertical: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  text: {
    flex: 1,
    gap: space.xs,
  },
  label: type.eyebrow,
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: surface.white,
    boxShadow: shadows.soft,
  },
  value: {
    ...type.menuLabel,
    flexShrink: 1,
  },
  content: {
    paddingTop: space.xs,
    gap: space.xs,
  },
});
