// A summary row: a field's label and value, with a small soft action on
// the right (e.g. "Change"). `children` show under the row when it's open
// - e.g. the field's picker. `swatches` (colour hexes) show as small
// circles with a white ring before the value. Rows are separated by space,
// not lines.

import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";
import { boxEdge, textSizes, type } from "../../theme/soft";

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
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${label.toLowerCase()}`}
        accessibilityState={{ expanded: open }}
        hitSlop={8}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </Pressable>
    </View>
    {open ? <View style={styles.content}>{children}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  field: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    ...type.eyebrow,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.inverse,
    boxShadow: shadows.soft,
  },
  value: {
    flexShrink: 1,
    fontFamily: fontWeights.regular,
    fontSize: textSizes.lg,
    color: colors.main,
  },
  action: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.cardBackground,
    ...boxEdge,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  actionLabel: {
    fontFamily: fontWeights.medium,
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  content: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
});
