// A summary row: a field's label and value, with a small greyed-out
// action on the right (e.g. "Change"). `children` show under the row when
// it's open - e.g. the field's picker. `swatches` (colour hexes) show as
// small circles before the value.

import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";

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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hoverBorder,
  },
  value: {
    flexShrink: 1,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    color: colors.main,
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.5,
  },
  actionLabel: {
    fontSize: fontSizes.small,
    color: colors.muted,
  },
  content: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
});
